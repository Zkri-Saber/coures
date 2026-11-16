Time to put the pieces together. In this lesson and the next, you'll build a working to-do app. This lesson covers **Create** and **Read**.

## How the app works

```text
 Browser                         Flask                      PostgreSQL
 ───────                         ─────                      ──────────
 GET /            ───────▶  index(): query to-dos   ───▶   SELECT ...
                  ◀───────  HTML page (template)
 fetch POST /todos ──────▶  create_todo(): add + commit ─▶ INSERT ...
   {"description": ...}
                  ◀───────  JSON: the new to-do
```

The page loads with all to-dos rendered by a **template**. Adding a to-do sends a **fetch** request with JSON, and the page updates without reloading.

## The views

Make sure your `todos` table exists (from the Migrations lesson). Then add these imports and views to `app.py`:

```python
import sys
from flask import Flask, render_template, request, jsonify, abort
```

```python
@app.route("/")
def index():
    todos = db.session.execute(db.select(Todo).order_by(Todo.id)).scalars().all()
    return render_template("index.html", todos=todos)


@app.post("/todos")
def create_todo():
    data = request.get_json(silent=True) or {}
    description = (data.get("description") or "").strip()
    if not description:
        abort(400)                     # Bad Request: nothing to save
    try:
        todo = Todo(description=description)
        db.session.add(todo)
        db.session.commit()
        return jsonify(id=todo.id, description=todo.description, completed=todo.completed), 201
    except Exception:
        db.session.rollback()          # leave the session usable
        print(sys.exc_info())          # show the error in the terminal
        abort(500)
```

Notice the pattern in `create_todo`:

1. **Validate** the input first, and reject bad data with `400`.
2. **Try** the database work.
3. On failure, **roll back** and return `500`.
4. On success, return the new object and `201 Created`.

## The template

Flask looks for templates in a `templates` folder. Create `templates/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Todo app</title>
</head>
<body>
  <h1>My to-dos</h1>

  <form id="new-todo">
    <input id="description" placeholder="What do you need to do?" required>
    <button>Add</button>
  </form>
  <p id="error" hidden>Something went wrong. Please try again.</p>

  <ul id="todos">
    {% for todo in todos %}
      <li>{{ todo.description }}</li>
    {% endfor %}
  </ul>

  <script>
    const form = document.getElementById("new-todo");
    const input = document.getElementById("description");
    const error = document.getElementById("error");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();                        // don't reload the page
      const res = await fetch("/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: input.value }),
      });
      if (!res.ok) {
        error.hidden = false;
        return;
      }
      const todo = await res.json();             // the new to-do, sent back by Flask
      const li = document.createElement("li");
      li.textContent = todo.description;
      document.getElementById("todos").appendChild(li);
      input.value = "";
      error.hidden = true;
    });
  </script>
</body>
</html>
```

The `{% for %}` and `{{ }}` parts are **Jinja**, Flask's template language. Jinja automatically escapes text, so a to-do containing `<script>` is shown as text rather than run. In JavaScript, `textContent` does the same job.

## Run it

```bash
flask --app app run --debug
```

Open <http://127.0.0.1:5000>, add a few to-dos, then refresh: they're still there, because they're in PostgreSQL. Check with `SELECT * FROM todos;` in `psql`.

> `--debug` reloads the server when you save a file and shows detailed errors in the browser. **Never use debug mode on a public server**: the debugger can let visitors run code.

## Why send JSON instead of submitting the form?

A classic HTML form submission reloads the whole page. Sending JSON with `fetch` keeps the page in place and lets the server reply with just the data that changed. It's also exactly how APIs work, which is where Part 3 of the program goes next.

:::quiz
Q: What status code should `create_todo` return when the description is empty?
- [ ] 201
- [x] 400
- [ ] 500
Why: 400 Bad Request means the client sent invalid data. 500 is for unexpected server errors, and 201 means something was created.

Q: Why does `create_todo` call `db.session.rollback()` in the `except` block?
- [ ] To delete all to-dos
- [x] To undo the failed transaction and leave the session usable
- [ ] To speed up the next request
Why: After an error, the session must be rolled back before it can be used again.

Q: What does `e.preventDefault()` do in the form's submit handler?
- [x] Stops the browser from submitting the form and reloading the page
- [ ] Prevents empty to-dos
- [ ] Blocks the request to the server
Why: It cancels the browser's default form submission, so your `fetch` code handles it instead.
:::
