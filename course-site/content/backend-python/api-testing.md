Clicking around with curl proves an endpoint works *today*. **Automated tests** prove it still works after every change you make, in seconds. In this lesson you'll write tests for the bookshelf API.

## Why test?

- **Catch mistakes early**, before users (or your teacher) do.
- **Change code confidently.** If the tests still pass after a refactor, you didn't break anything.
- **Document behaviour.** A test like `test_404_when_deleting_missing_book` explains exactly what the API promises.

## The tools

- **`unittest`** is Python's built-in testing framework. (`pytest` is a popular alternative with shorter syntax. The ideas are the same.)
- **Flask's test client** sends fake requests to your app without starting a server.
- A **separate test database**, `bookshelf_test`, so tests never touch real data.

## Write the tests

Create `test_app.py` next to `app.py`:

```python
import unittest
from app import create_app
from models import db, Book


class BookshelfTestCase(unittest.TestCase):
    def setUp(self):
        """Runs before EACH test: a fresh app and a known set of data."""
        self.app = create_app({
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "postgresql+psycopg://postgres:postgres@localhost:5432/bookshelf_test",
        })
        self.client = self.app.test_client()
        with self.app.app_context():
            db.drop_all()
            db.create_all()
            db.session.add_all([
                Book(title="The Hobbit", author="J. R. R. Tolkien", rating=5),
                Book(title="Dune", author="Frank Herbert", rating=4),
            ])
            db.session.commit()

    def tearDown(self):
        """Runs after EACH test: clean up."""
        with self.app.app_context():
            db.session.remove()
            db.drop_all()
            db.engine.dispose()

    def test_get_paginated_books(self):
        res = self.client.get("/api/books")
        data = res.get_json()
        self.assertEqual(res.status_code, 200)
        self.assertTrue(data["success"])
        self.assertEqual(data["total_books"], 2)
        self.assertEqual(len(data["books"]), 2)

    def test_404_for_page_beyond_last(self):
        res = self.client.get("/api/books?page=1000")
        self.assertEqual(res.status_code, 404)
        self.assertFalse(res.get_json()["success"])
        self.assertEqual(res.get_json()["message"], "resource not found")

    def test_create_book(self):
        res = self.client.post("/api/books", json={"title": "Emma", "author": "Jane Austen", "rating": 4})
        self.assertEqual(res.status_code, 201)
        self.assertTrue(res.get_json()["created"])

    def test_400_when_creating_without_title(self):
        res = self.client.post("/api/books", json={"author": "Nobody"})
        self.assertEqual(res.status_code, 400)

    def test_update_rating(self):
        res = self.client.patch("/api/books/1", json={"rating": 1})
        self.assertEqual(res.get_json()["book"]["rating"], 1)

    def test_delete_book(self):
        res = self.client.delete("/api/books/2")
        self.assertEqual(res.get_json()["deleted"], 2)
        with self.app.app_context():
            self.assertIsNone(db.session.get(Book, 2))

    def test_404_when_deleting_missing_book(self):
        res = self.client.delete("/api/books/999")
        self.assertEqual(res.status_code, 404)

    def test_search(self):
        res = self.client.post("/api/books/search", json={"search_term": "hob"})
        self.assertEqual(res.get_json()["total_books"], 1)

    def test_405_wrong_method(self):
        res = self.client.put("/api/books")
        self.assertEqual(res.status_code, 405)


if __name__ == "__main__":
    unittest.main()
```

Run them:

```bash
python -m unittest -v
```

```text
test_400_when_creating_without_title ... ok
test_404_for_page_beyond_last ... ok
...
Ran 9 tests in 0.3s

OK
```

Notice how each test:

1. **Arranges** a known starting state (`setUp`)
2. **Acts** by sending one request
3. **Asserts** what should be true afterwards

Every test checks one behaviour. Test the **success** case *and* the **error** cases for each endpoint.

## Test-driven development (TDD)

With TDD, you write the test **before** the code:

1. **Red:** write a test for the behaviour you want. Run it and watch it fail.
2. **Green:** write the simplest code that makes it pass.
3. **Refactor:** tidy the code while keeping the tests green.

Try it: write a test for `GET /api/books/<id>` returning a single book, watch it fail if the endpoint doesn't exist yet, then make it pass. TDD feels slow at first, but it makes you think about what the API should do before deciding how.

## Good testing habits

- Keep tests **independent**: each one sets up its own data, so they can run in any order.
- Use **descriptive names**: `test_404_when_deleting_missing_book`, not `test3`.
- Run the whole suite **before every commit**.
- When you find a bug, **write a test that reproduces it first**, then fix it. That bug can never silently return.

:::quiz
Q: Why do the tests use a separate `bookshelf_test` database?
- [ ] Test databases are faster
- [x] So tests can freely create and delete data without touching real data
- [ ] Flask can only test with a different database name
Why: Tests drop and recreate tables. Doing that on your real database would destroy it.

Q: When does `setUp` run?
- [ ] Once, before all the tests
- [x] Before each individual test
- [ ] Only when a test fails
Why: Running before every test gives each one a fresh, predictable starting point.

Q: In test-driven development, what comes first?
- [ ] Writing the code
- [x] Writing a failing test
- [ ] Refactoring
Why: TDD follows red, green, refactor: the failing test defines the goal before you write code.
:::
