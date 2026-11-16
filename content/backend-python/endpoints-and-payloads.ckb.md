ئێستا با API ـێکی تەواو دروست بکەین: **ڕەفەی کتێب** (bookshelf) کە کتێبەکان لە PostgreSQL دا هەڵدەگرێت. مامەڵە لەگەڵ هەموو کردارێکی CRUD دەکەیت، داتا لە URL، لە query string و لە ناوەڕۆکی JSON دەخوێنیتەوە، ئەنجامەکان پەڕە پەڕە (paginate) دەکەیت، و هەڵەی یەکگرتوو دەگەڕێنیتەوە.

## ئامادەکردنی پرۆژە

بنکەدراوەیەک بە ناوی `bookshelf` دروست بکە (و یەکێکی تر بە ناوی `bookshelf_test` بۆ وانەی داهاتوو)، پاشان پاکێجەکان دابمەزرێنە:

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

مێتۆدی `format()` بە وردی بڕیار دەدات API کام خانانە ئاشکرا دەکات. هەرگیز ڕیزی تەواوی بنکەدراوە بە کوێرانە مەنێرە: لەوانەیە خانەگەلێک بدزێنە دەرەوە کە مەبەستت نەبووە هاوبەشیان بکەیت.

## کارگەی بەرنامە (app factory)

لە جیاتی دروستکردنی `app` لە سەرەوەی فایلەکە، لەناو فەنکشنێکدا بیپێچەوە. ئەم **کارگەی بەرنامەیە** (application factory) ڕێگە بە تاقیکردنەوەکان دەدات بەرنامەیەک بە ڕێکخستنێکی جیاواز دروست بکەن، وەک بنکەدراوەیەکی تاقیکردنەوە.

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

بە `flask --app app run --debug` جێبەجێی بکە. Flask خۆکارانە فەنکشنی `create_app` دەدۆزێتەوە. خشتەکە یەک جار لە شێڵی Flask ـەوە دروست بکە (`flask --app app shell`، پاشان `db.create_all()`)، یان کۆچکردن (migrations) بەکاربهێنە وەک لە بەشی 2 دا.

## خاڵەکانی کۆتایی (endpoints)

ئەمانە لەناو `create_app` دا زیاد بکە، پێش `return app`.

### خوێندنەوەی پەڕەیەک لە کتێبەکان: `GET /api/books?page=2`

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

**پەڕەبەندی** (pagination) ئەنجامەکان بە پەڕە دەگەڕێنێتەوە، بۆ ئەوەی هیچ داواکارییەک هەوڵ نەدات 100,000 کتێب بە یەکجار بنێرێت. `type=int` بەهای query string دەگۆڕێت بۆ ژمارە و ئەگەر ژمارە نەبوو دەگەڕێتەوە بۆ بەها بنەڕەتییەکە.

### خوێندنەوەی یەک کتێب: `GET /api/books/7`

```python
    @app.get("/api/books/<int:book_id>")
    def get_book(book_id):
        book = db.get_or_404(Book, book_id)
        return jsonify(success=True, book=book.format())
```

### دروستکردن: `POST /api/books`

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

### نوێکردنەوە: `PATCH /api/books/7`

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

### سڕینەوە: `DELETE /api/books/7`

```python
    @app.delete("/api/books/<int:book_id>")
    def delete_book(book_id):
        book = db.get_or_404(Book, book_id)
        db.session.delete(book)
        db.session.commit()
        return jsonify(success=True, deleted=book_id)
```

### گەڕان: `POST /api/books/search`

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

گەڕان `POST` بەکاردەهێنێت بۆ ئەوەی وشەی گەڕانەکە لەناو ناوەڕۆکدا بگوازرێتەوە. `GET` لەگەڵ `?q=` ـیش باوە؛ یەک شێواز هەڵبژێرە و بە بەردەوامی بەکاری بهێنە.

## هەڵەی یەکگرتوو

بە شێوەی بنەڕەتی، Flask پەڕەکانی هەڵە وەک **HTML** دەگەڕێنێتەوە. ڕاژەخوازێکی API چاوەڕێی **JSON** دەکات. لەناو `create_app` دا چارەسەرکەری هەڵە (error handlers) تۆمار بکە:

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

ئێستا **هەموو** وەڵامێک، سەرکەوتوو بێت یان شکستخواردوو، هەمان شێوەی هەیە. ڕاژەخوازەکان هەمیشە دەتوانن `success` بپشکنن، و لە کاتی شکستدا `error` و `message` بخوێننەوە.

## بە curl تاقی بکەرەوە

```bash
curl -X POST http://127.0.0.1:5000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title": "Emma", "author": "Jane Austen", "rating": 4}'

curl http://127.0.0.1:5000/api/books
curl -X PATCH http://127.0.0.1:5000/api/books/1 -H "Content-Type: application/json" -d '{"rating": 3}'
curl -X DELETE http://127.0.0.1:5000/api/books/1
curl -i http://127.0.0.1:5000/api/books/99
```

## دیزاینکردنی خاڵی کۆتایی باش

- **ناوی کۆ** (plural nouns) بۆ کۆمەڵەکان بەکاربهێنە: `/api/books`، نەک `/api/book` یان `/api/getBooks`.
- تەنها بۆ پیشاندانی خاوەندارێتیی ڕاستەقینە هێلانە (nest) بکە: `/api/categories/3/questions` پرسیارەکانی پۆلی 3 لیست دەکات.
- **ڕێگاکە** بەکاربهێنە بۆ دەربڕینی کردارەکە؛ کردار (verb) لە URL ـەکاندا دامەنێ (گەڕان ئاوارتەیەکی باوە).
- لە هەموو شوێنێکدا **هەمان شێوەی وەڵام** بگەڕێنەوە، لەگەڵ کۆدی دۆخی دروست.

:::quiz
Q: `book_id` لە `@app.get("/api/books/<int:book_id>")` دا لە کوێوە دێت؟
- [x] ڕێڕەوی URL
- [ ] query string
- [ ] ناوەڕۆکی JSON
Why: گۆڕاوەکانی ڕێڕەو لەناو کەوانەی گۆشەییدا لە ڕێڕەوەکەوە وەردەگیرێن و وەک ئارگیومێنت دەدرێن بە فەنکشنەکە.

Q: بۆچی خاڵەکانی کۆتایی لیست پەڕەبەندی بکەین؟
- [ ] HTTP پەڕەبەندی داوا دەکات
- [x] بۆ خۆپاراستن لە ناردنی وەڵامی زۆر گەورە و بارکردنی هەموو ڕیزەکان بە یەکجار
- [ ] بۆ شاردنەوەی داتا لە بەکارهێنەران
Why: گەڕاندنەوەی یەک پەڕە لە یەک کاتدا وەڵامەکان خێرا و بەکارهێنانی بیرگە کەم دەهێڵێتەوە لە کاتی زیادبوونی داتادا.

Q: بۆچی چارەسەرکەری هەڵەی JSON تۆمار بکەین؟
- [ ] هەڵەکان ون دەکەن
- [x] بۆ ئەوەی ڕاژەخوازەکانی API هەڵەکان بە هەمان شێوەی JSON ـی وەڵامە سەرکەوتووەکان وەربگرن، لە جیاتی پەڕەی HTML
- [ ] Flask بۆ دەستپێکردن پێویستی پێیانە
Why: هەڵەی JSON ـی یەکگرتوو ڕێگە بە ڕاژەخوازەکان دەدات لە کۆددا مامەڵە لەگەڵ شکستەکاندا بکەن.
:::
