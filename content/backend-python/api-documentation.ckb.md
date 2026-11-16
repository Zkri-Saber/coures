API ـێک کە کەس لێی تێنەگات، API ـێکە کە کەس بەکاری ناهێنێت. **بەڵگەنامەی** (documentation) باش ڕێگە بە گەشەپێدەرێکی تر دەدات (یان بە خۆت، شەش مانگ دواتر) پرۆژەکەت جێبەجێ بکات و API ـەکەت بانگ بکات بەبێ خوێندنەوەی کۆدەکەت.

## دوو جۆر بەڵگەنامە

1. **بەڵگەنامەی پرۆژە** (README): پرۆژەکە چییە، و چۆن دادەمەزرێت، جێبەجێ دەکرێت و تاقی دەکرێتەوە.
2. **سەرچاوەی API** (API reference): بە وردی چۆن هەر خاڵێکی کۆتایی بانگ بکەیت، و چی دەگەڕێتەوە.

هەردووکیان زۆرجار لە `README.md` دان لە سەرەوەی کۆگاکەت (repository)، کە GitHub پیشانی دەدات.

## قاڵبێکی README

نموونەکە بە ئینگلیزی دەمێنێتەوە، چونکە README ـەکانی پرۆژە زۆرجار بە ئینگلیزی دەنووسرێن:

````markdown
# Bookshelf API

An API for storing books and their ratings. Built with Flask, SQLAlchemy and PostgreSQL.

## Getting started

### Prerequisites
- Python 3.10+
- PostgreSQL

### Installation
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Database setup
```bash
createdb bookshelf
createdb bookshelf_test
```

### Run the server
```bash
flask --app app run --debug
```
The API runs at `http://127.0.0.1:5000`.

### Run the tests
```bash
python -m unittest -v
```

## API reference
(see below)
````

## بەڵگەنامەکردنی خاڵەکانی کۆتایی

سەرچاوەی API بەو شتانە دەست پێ بکە کە لە هەموو شوێنێکدا جێبەجێ دەبن:

- **URL ـی بنەڕەت:** `http://127.0.0.1:5000/api` کاتێک لەسەر کۆمپیوتەری خۆت جێبەجێی دەکەیت
- **ناسینەوە (Authentication):** لەم وەشانەدا هیچ (یان چۆن تۆکنێک بنێریت)
- **هەڵەکان:** هەموو هەڵەیەک بەم شێوەیە دەردەکەوێت:

```json
{ "success": false, "error": 404, "message": "resource not found" }
```

| کۆد | پەیام |
| --- | --- |
| 400 | bad request |
| 404 | resource not found |
| 405 | method not allowed |
| 422 | unprocessable |

پاشان هەر خاڵێکی کۆتایی بە هەمان پێکهاتە بەڵگەنامە بکە:

````markdown
### GET /books

Returns a page of books, ordered by id, and the total number of books.

**Query parameters**
- `page` (integer, optional, default `1`): which page of 8 books to return

**Example request**
```bash
curl http://127.0.0.1:5000/api/books?page=1
```

**Example response**
```json
{
  "success": true,
  "books": [
    { "id": 1, "title": "The Hobbit", "author": "J. R. R. Tolkien", "rating": 5 }
  ],
  "total_books": 1
}
```

**Errors**: `404` if the page is beyond the last book.
````

بۆ ئەو خاڵانەی کۆتایی کە ناوەڕۆک وەردەگرن، هەموو خانەیەک بەڵگەنامە بکە: ناوەکەی، جۆرەکەی، ئایا پێویستە، و مانای چییە.

## ئامۆژگاری

- **وەڵامی ڕاستەقینە کۆپی بکە.** فەرمانی curl جێبەجێ بکە و ئەوەی دەگەڕێتەوە بیلکێنە، بۆ ئەوەی گەرەنتی بکرێت بەڵگەنامەکان ڕێک بن.
- **بەڵگەنامەکان لە هەمان commit ـی کۆدەکەدا نوێ بکەرەوە.** بەڵگەنامەی بەسەرچوو خراپترە لە هیچ.
- **یەکگرتوو بە.** هەمان سەردێڕەکان، هەمان ڕیزبەندی، هەمان شێوازی نموونە بۆ هەموو خاڵێکی کۆتایی.
- **بۆ کەسێکی تازە بنووسە.** وا دابنێ خوێنەر هەرگیز پرۆژەکەتی نەبینیوە.

## زیاتر بڕۆ: OpenAPI

تیمە گەورەکان زۆرجار API ـەکان بە شێوەی **OpenAPI** وەسف دەکەن، کە تایبەتمەندنامەیەکە ئامێر دەتوانێت بیخوێنێتەوە. پاشان ئامرازەکان دەتوانن بەڵگەنامەی کارلێککار (وەک Swagger UI)، کتێبخانەی ڕاژەخواز و تاقیکردنەوەی لێ دروست بکەن. شایەنی گەڕانە کاتێک بە نووسینی بەڵگەنامە بە دەست ڕاهاتیت.

:::quiz
Q: چی دەچێتە ناو README ـی پرۆژەیەکەوە؟
- [ ] تەنها مۆڵەتنامەکە (license)
- [x] پرۆژەکە چی دەکات، و چۆن دادەمەزرێت، جێبەجێ دەکرێت و تاقی دەکرێتەوە
- [ ] هەموو دێڕێکی کۆدی سەرچاوە
Why: README دەرگای سەرەکییە: دەبێت کەسێکی تازە لە سفرەوە بگەیەنێتە پرۆژەیەکی کارپێکراو.

Q: متمانەپێکراوترین ڕێگا بۆ نووسینی وەڵامی نموونە چییە؟
- [ ] ئەوە بنووسە کە پێت وایە API دەیگەڕێنێتەوە
- [x] داواکارییەکە جێبەجێ بکە و وەڵامە ڕاستەقینەکە بیلکێنە
- [ ] لێیان گەڕێ
Why: دەرچووی ڕاستەقینە گەرەنتی دەکات کە بەڵگەنامەکە لەگەڵ ئەوەی API بەڕاستی دەیکات یەک دەگرێتەوە.
:::
