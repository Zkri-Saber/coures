An API nobody understands is an API nobody uses. Good **documentation** lets another developer (or you, six months from now) run your project and call your API without reading your code.

## Two kinds of documentation

1. **Project documentation** (the README): what the project is, and how to install, run and test it.
2. **API reference**: exactly how to call each endpoint, and what comes back.

Both usually live in `README.md` at the top of your repository, where GitHub displays it.

## A README template

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

## Documenting endpoints

Start the API reference with the things that apply everywhere:

- **Base URL:** `http://127.0.0.1:5000/api` when running locally
- **Authentication:** none in this version (or how to send a token)
- **Errors:** every error looks like this:

```json
{ "success": false, "error": 404, "message": "resource not found" }
```

| Code | Message |
| --- | --- |
| 400 | bad request |
| 404 | resource not found |
| 405 | method not allowed |
| 422 | unprocessable |

Then document each endpoint with the same structure:

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

For endpoints that take a body, document every field: its name, type, whether it's required, and what it means.

## Tips

- **Copy real responses.** Run the curl command and paste what comes back, so the docs are guaranteed to match.
- **Update docs in the same commit as the code.** Out-of-date docs are worse than none.
- **Be consistent.** Same headings, same order, same example style for every endpoint.
- **Write for a newcomer.** Assume the reader has never seen your project.

## Going further: OpenAPI

Larger teams often describe APIs in the **OpenAPI** format, a machine-readable specification. Tools can then generate interactive docs (like Swagger UI), client libraries and tests from it. It's worth exploring once you're comfortable writing docs by hand.

:::quiz
Q: What belongs in a project README?
- [ ] Only the license
- [x] What the project does, and how to install, run and test it
- [ ] Every line of the source code
Why: The README is the front door: it should get a newcomer from zero to a running project.

Q: What's the most reliable way to write example responses?
- [ ] Type what you think the API returns
- [x] Run the request and paste the real response
- [ ] Leave them out
Why: Real output guarantees the documentation matches what the API actually does.
:::
