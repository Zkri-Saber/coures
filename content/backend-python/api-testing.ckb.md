کلیککردن بە curl دەیسەلمێنێت کە خاڵێکی کۆتایی *ئەمڕۆ* کار دەکات. **تاقیکردنەوەی خۆکار** دەیسەلمێنێت کە دوای هەموو گۆڕانکارییەک هێشتا کار دەکات، لە چەند چرکەیەکدا. لەم وانەیەدا تاقیکردنەوە بۆ API ـی ڕەفەی کتێب دەنووسیت.

## بۆچی تاقی بکەینەوە؟

- **هەڵەکان زوو بگرە**، پێش ئەوەی بەکارهێنەران (یان مامۆستاکەت) بیانگرن.
- **کۆد بە متمانەوە بگۆڕە.** ئەگەر دوای ڕێکخستنەوەی کۆد (refactor) تاقیکردنەوەکان هێشتا سەرکەوتوو بن، هیچت تێک نەداوە.
- **ڕەفتار تۆمار بکە.** تاقیکردنەوەیەکی وەک `test_404_when_deleting_missing_book` بە وردی ڕوون دەکاتەوە API بەڵێنی چی دەدات.

## ئامرازەکان

- **`unittest`** چوارچێوەی تاقیکردنەوەی ناوخۆیی پایتۆنە. (`pytest` جێگرەوەیەکی بەناوبانگە بە ڕێزمانی کورتتر. بیرۆکەکان هەمانن.)
- **ڕاژەخوازی تاقیکردنەوەی Flask** داواکاریی ساختە دەنێرێت بۆ بەرنامەکەت بەبێ دەستپێکردنی ڕاژەکارێک.
- **بنکەدراوەیەکی جیای تاقیکردنەوە**، `bookshelf_test`، بۆ ئەوەی تاقیکردنەوەکان هەرگیز دەست لە داتای ڕاستەقینە نەدەن.

## تاقیکردنەوەکان بنووسە

`test_app.py` لە تەنیشت `app.py` دروست بکە:

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

جێبەجێیان بکە:

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

سەرنج بدە چۆن هەر تاقیکردنەوەیەک:

1. **ڕێکدەخات** دۆخێکی سەرەتایی ناسراو (`setUp`)
2. **کار دەکات** بە ناردنی یەک داواکاری
3. **دڵنیا دەبێتەوە** لەوەی کە دواتر دەبێت ڕاست بێت

هەر تاقیکردنەوەیەک یەک ڕەفتار دەپشکنێت. بۆ هەر خاڵێکی کۆتایی، حاڵەتی **سەرکەوتن** *و* حاڵەتەکانی **هەڵە** تاقی بکەرەوە.

## گەشەپێدانی بە ڕێبەری تاقیکردنەوە (TDD)

لەگەڵ TDD، تاقیکردنەوەکە **پێش** کۆدەکە دەنووسیت:

1. **سوور:** تاقیکردنەوەیەک بۆ ئەو ڕەفتارە بنووسە کە دەتەوێت. جێبەجێی بکە و سەیری شکستەکەی بکە.
2. **سەوز:** سادەترین کۆد بنووسە کە سەرکەوتووی بکات.
3. **ڕێکخستنەوە:** کۆدەکە ڕێکوپێک بکە لە کاتێکدا تاقیکردنەوەکان سەوز دەمێننەوە.

تاقی بکەرەوە: تاقیکردنەوەیەک بنووسە بۆ ئەوەی `GET /api/books/<id>` یەک کتێب بگەڕێنێتەوە، سەیری شکستەکەی بکە ئەگەر خاڵی کۆتاییەکە هێشتا بوونی نەبێت، پاشان سەرکەوتووی بکە. TDD لە سەرەتادا هێواش هەست پێ دەکرێت، بەڵام وات لێ دەکات بیر لەوە بکەیتەوە API دەبێت چی بکات پێش بڕیاردان لەسەر چۆنیەتییەکەی.

## خووی باشی تاقیکردنەوە

- تاقیکردنەوەکان **سەربەخۆ** بهێڵەوە: هەر یەکێکیان داتای خۆی ئامادە دەکات، بۆ ئەوەی بە هەر ڕیزێک جێبەجێ بکرێن.
- **ناوی ڕوونکەرەوە** بەکاربهێنە: `test_404_when_deleting_missing_book`، نەک `test3`.
- هەموو کۆمەڵەکە **پێش هەموو commit ـێک** جێبەجێ بکە.
- کاتێک هەڵەیەک دەدۆزیتەوە، **سەرەتا تاقیکردنەوەیەک بنووسە کە دووبارەی بکاتەوە**، پاشان چاکی بکە. ئەو هەڵەیە هەرگیز بە بێدەنگی ناگەڕێتەوە.

:::quiz
Q: بۆچی تاقیکردنەوەکان بنکەدراوەیەکی جیای `bookshelf_test` بەکاردەهێنن؟
- [ ] بنکەدراوەی تاقیکردنەوە خێراترن
- [x] بۆ ئەوەی تاقیکردنەوەکان بە ئازادی داتا دروست بکەن و بیسڕنەوە بەبێ دەستلێدان لە داتای ڕاستەقینە
- [ ] Flask تەنها دەتوانێت بە ناوێکی جیاوازی بنکەدراوە تاقی بکاتەوە
Why: تاقیکردنەوەکان خشتەکان دەسڕنەوە و دووبارە دروستیان دەکەنەوە. کردنی ئەوە لەسەر بنکەدراوە ڕاستەقینەکەت لەناوی دەبات.

Q: `setUp` کەی جێبەجێ دەبێت؟
- [ ] یەک جار، پێش هەموو تاقیکردنەوەکان
- [x] پێش هەر تاقیکردنەوەیەکی تاک
- [ ] تەنها کاتێک تاقیکردنەوەیەک شکست دەهێنێت
Why: جێبەجێبوون پێش هەموو تاقیکردنەوەیەک خاڵێکی دەستپێکی نوێ و پێشبینیکراو بە هەر یەکێکیان دەدات.

Q: لە گەشەپێدانی بە ڕێبەری تاقیکردنەوەدا، چی یەکەم دێت؟
- [ ] نووسینی کۆدەکە
- [x] نووسینی تاقیکردنەوەیەکی شکستخواردوو
- [ ] ڕێکخستنەوە
Why: TDD پەیڕەوی سوور، سەوز، ڕێکخستنەوە دەکات: تاقیکردنەوە شکستخواردووەکە ئامانجەکە دیاری دەکات پێش ئەوەی کۆد بنووسیت.
:::
