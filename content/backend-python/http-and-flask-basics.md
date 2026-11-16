Every API call is an **HTTP request** followed by an **HTTP response**. Understanding them precisely is what separates guessing from debugging.

## Anatomy of a request

```text
POST /api/books HTTP/1.1                    ← method, path, version
Host: 127.0.0.1:5000                        ← headers
Content-Type: application/json
Authorization: Bearer eyJhbGciOi...

{"title": "Emma", "author": "Jane Austen"}  ← body (optional)
```

- **Method:** what you want to do
- **Path:** which resource, plus an optional **query string** like `?page=2`
- **Headers:** extra information, such as the body's format or your credentials
- **Body:** the data you're sending, usually JSON

## HTTP methods

| Method | Use it to | Has a body? |
| --- | --- | --- |
| `GET` | Read a resource or a list | No |
| `POST` | Create a new resource, or run an action like a search | Yes |
| `PUT` | Replace a resource completely | Yes |
| `PATCH` | Change part of a resource | Yes |
| `DELETE` | Remove a resource | Usually no |

`GET` requests should never change data. Browsers, caches and search engines assume they're safe to repeat.

## Anatomy of a response

```text
HTTP/1.1 201 CREATED                        ← status code
Content-Type: application/json              ← headers

{"success": true, "created": 3}             ← body
```

## Status codes

The first digit tells you the category: **2xx** success, **4xx** the client made a mistake, **5xx** the server failed.

| Code | Meaning | When to use it |
| --- | --- | --- |
| `200 OK` | Success | Most successful requests |
| `201 Created` | A new resource was created | After a successful `POST` |
| `204 No Content` | Success, nothing to send back | Sometimes used after `DELETE` |
| `400 Bad Request` | The request is malformed or missing data | Missing required fields |
| `401 Unauthorized` | Not logged in, or invalid credentials | No or bad token (Part 4) |
| `403 Forbidden` | Logged in, but not allowed | Missing permission (Part 4) |
| `404 Not Found` | The resource doesn't exist | Unknown ID or URL |
| `405 Method Not Allowed` | The URL exists but not for this method | `PUT` on a `GET`-only route |
| `422 Unprocessable` | Well-formed, but can't be processed | Valid JSON that breaks a rule |
| `500 Internal Server Error` | Something broke on the server | Unexpected exceptions |

## Your first Flask API

Create a new folder and virtual environment (as in the setup lesson), then install Flask and create `app.py`:

```python
from flask import Flask, jsonify, request

app = Flask(__name__)


@app.get("/api/hello")
def hello():
    name = request.args.get("name", "world")
    return jsonify(message=f"Hello, {name}!")


@app.post("/api/echo")
def echo():
    data = request.get_json(silent=True)
    if data is None:
        return jsonify(error="Send JSON with Content-Type: application/json"), 400
    return jsonify(you_sent=data), 201
```

- `@app.get` and `@app.post` register a function for a URL and method.
- `jsonify()` turns Python data into a JSON response with the right `Content-Type` header.
- `request.args` holds the query string; `request.get_json()` reads a JSON body.
- Returning a tuple, `(response, 201)`, sets the status code.

Run it:

```bash
flask --app app run --debug
```

## Test endpoints with curl

`curl` sends HTTP requests from the terminal. It's built into macOS, Linux and Windows 10 and later. Open a **second** terminal while Flask is running:

```bash
curl http://127.0.0.1:5000/api/hello
curl "http://127.0.0.1:5000/api/hello?name=Sara"

curl -X POST http://127.0.0.1:5000/api/echo \
  -H "Content-Type: application/json" \
  -d '{"course": "backend"}'

curl -i http://127.0.0.1:5000/api/nothing-here
```

| Flag | Meaning |
| --- | --- |
| `-X POST` | Use this method |
| `-H "..."` | Add a header |
| `-d '...'` | Send this body |
| `-i` | Show the status line and headers too |

> On Windows PowerShell, use `curl.exe` and put JSON in double quotes with escaped inner quotes, or use a graphical tool like [Postman](https://www.postman.com) or [Bruno](https://www.usebruno.com).

## Allowing browsers from other sites: CORS

If a frontend at `http://localhost:3000` calls your API at `http://127.0.0.1:5000`, the browser blocks it by default. This **same-origin policy** protects users. **CORS** (Cross-Origin Resource Sharing) is how your API tells the browser which other origins may call it.

```bash
pip install flask-cors
```

```python
from flask_cors import CORS

CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
```

Only list the origins that really need access. `"*"` (any site) is fine for a public, read-only API, but not for one that uses logins.

:::quiz
Q: A client sends a valid request to create a book, and it's saved. Which status code fits best?
- [ ] 200
- [x] 201
- [ ] 204
Why: 201 Created tells the client a new resource now exists.

Q: Which status code means "you're logged in, but you're not allowed to do this"?
- [ ] 401
- [x] 403
- [ ] 404
Why: 401 means not authenticated. 403 means authenticated but not authorized.

Q: What does CORS control?
- [ ] Which databases your API can connect to
- [x] Which other websites' JavaScript is allowed to call your API from a browser
- [ ] How fast your API responds
Why: CORS headers tell browsers whether pages from another origin may read your API's responses.
:::
