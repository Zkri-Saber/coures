Now let's build a complete API: a **bookshelf** that stores books in PostgreSQL. You'll handle every CRUD operation, read data from the URL, the query string and the JSON body, paginate results, and return consistent errors.

## Project setup

Create a database called `bookshelf` (and another called `bookshelf_test` for the next lesson), then install the packages:

```bash
pip install flask flask-sqlalchemy flask-cors "psycopg[binary]"
```

### `models.py`

```python
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)


class Book(db.Model):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    author: Mapped[str] = mapped_column(String(120))
    rating: Mapped[int] = mapped_column(default=0)

    def format(self):
        return {"id": self.id, "title": self.title, "author": self.author, "rating": self.rating}
```

The `format()` method decides exactly which fields the API exposes. Never send whole database rows blindly: you might leak fields you didn't mean to share.

## The app factory

Instead of creating `app` at the top of the file, wrap it in a function. This **application factory** lets tests create an app with a different configuration, such as a test database.

### `app.py`

```python
import os
from flask import Flask, jsonify, request, abort
from flask_cors import CORS
from models import db, Book

BOOKS_PER_PAGE = 8


def paginate(query, page):
    start = (page - 1) * BOOKS_PER_PAGE
    return db.session.execute(query.offset(start).limit(BOOKS_PER_PAGE)).scalars().all()


def create_app(test_config=None):
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/bookshelf"
    )
    if test_config:
        app.config.update(test_config)
    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # --- endpoints go here (below) ---

    return app
```

Run it with `flask --app app run --debug`. Flask finds the `create_app` function automatically. Create the table once from the Flask shell (`flask --app app shell`, then `db.create_all()`), or use migrations as in Part 2.

## The endpoints

Add these inside `create_app`, before `return app`.

### Read a page of books: `GET /api/books?page=2`

```python
    @app.get("/api/books")
    def list_books():
        page = request.args.get("page", 1, type=int)
        books = paginate(db.select(Book).order_by(Book.id), page)
        if not books:
            abort(404)
        total = db.session.execute(db.select(db.func.count()).select_from(Book)).scalar()
        return jsonify(success=True, books=[b.format() for b in books], total_books=total)
```

**Pagination** returns results in pages, so a request never tries to send 100,000 books at once. `type=int` converts the query string value and falls back to the default if it isn't a number.

### Read one book: `GET /api/books/7`

```python
    @app.get("/api/books/<int:book_id>")
    def get_book(book_id):
        book = db.get_or_404(Book, book_id)
        return jsonify(success=True, book=book.format())
```

### Create: `POST /api/books`

```python
    @app.post("/api/books")
    def create_book():
        body = request.get_json(silent=True) or {}
        title, author = body.get("title"), body.get("author")
        if not title or not author:
            abort(400)
        try:
            book = Book(title=title, author=author, rating=int(body.get("rating", 0)))
            db.session.add(book)
            db.session.commit()
            return jsonify(success=True, created=book.id), 201
        except Exception:
            db.session.rollback()
            abort(422)
```

### Update: `PATCH /api/books/7`

```python
    @app.patch("/api/books/<int:book_id>")
    def update_rating(book_id):
        book = db.get_or_404(Book, book_id)
        body = request.get_json(silent=True) or {}
        if "rating" not in body:
            abort(400)
        try:
            book.rating = int(body["rating"])
            db.session.commit()
            return jsonify(success=True, book=book.format())
        except (ValueError, TypeError):
            db.session.rollback()
            abort(400)
```

### Delete: `DELETE /api/books/7`

```python
    @app.delete("/api/books/<int:book_id>")
    def delete_book(book_id):
        book = db.get_or_404(Book, book_id)
        db.session.delete(book)
        db.session.commit()
        return jsonify(success=True, deleted=book_id)
```

### Search: `POST /api/books/search`

```python
    @app.post("/api/books/search")
    def search_books():
        body = request.get_json(silent=True) or {}
        term = body.get("search_term", "")
        books = db.session.execute(
            db.select(Book).where(Book.title.ilike(f"%{term}%")).order_by(Book.id)
        ).scalars().all()
        return jsonify(success=True, books=[b.format() for b in books], total_books=len(books))
```

Search uses `POST` so the search term travels in the body. A `GET` with `?q=` is also common; pick one style and use it consistently.

## Consistent errors

By default, Flask returns error pages as **HTML**. An API client expects **JSON**. Register error handlers inside `create_app`:

```python
    def error_response(status, message):
        return jsonify(success=False, error=status, message=message), status

    @app.errorhandler(400)
    def bad_request(error):
        return error_response(400, "bad request")

    @app.errorhandler(404)
    def not_found(error):
        return error_response(404, "resource not found")

    @app.errorhandler(405)
    def method_not_allowed(error):
        return error_response(405, "method not allowed")

    @app.errorhandler(422)
    def unprocessable(error):
        return error_response(422, "unprocessable")

    @app.errorhandler(500)
    def server_error(error):
        return error_response(500, "internal server error")
```

Now **every** response, success or failure, has the same shape. Clients can always check `success`, and on failure read `error` and `message`.

## Try it with curl

```bash
curl -X POST http://127.0.0.1:5000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title": "Emma", "author": "Jane Austen", "rating": 4}'

curl http://127.0.0.1:5000/api/books
curl -X PATCH http://127.0.0.1:5000/api/books/1 -H "Content-Type: application/json" -d '{"rating": 3}'
curl -X DELETE http://127.0.0.1:5000/api/books/1
curl -i http://127.0.0.1:5000/api/books/99
```

## Designing good endpoints

- Use **plural nouns** for collections: `/api/books`, not `/api/book` or `/api/getBooks`.
- Nest only to show real ownership: `/api/categories/3/questions` lists the questions in category 3.
- Use the **method** to express the action; keep verbs out of URLs (search is a common exception).
- Return the **same response shape** everywhere, and the right status code.

:::quiz
Q: Where does `book_id` come from in `@app.get("/api/books/<int:book_id>")`?
- [x] The URL path
- [ ] The query string
- [ ] The JSON body
Why: Route variables in angle brackets are taken from the path and passed to the function as arguments.

Q: Why paginate list endpoints?
- [ ] Pagination is required by HTTP
- [x] To avoid sending huge responses and loading every row at once
- [ ] To hide data from users
Why: Returning a page at a time keeps responses fast and memory use low as data grows.

Q: Why register JSON error handlers?
- [ ] They make errors disappear
- [x] So API clients get errors in the same JSON format as successful responses, instead of HTML pages
- [ ] Flask requires them to start
Why: Consistent JSON errors let clients handle failures in code.
:::
