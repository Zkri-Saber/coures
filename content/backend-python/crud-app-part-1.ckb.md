کاتی پێکەوە بەستنی بەشەکانە. لەم وانەیە و وانەی داهاتوودا، بەرنامەیەکی کارای لیستی کارەکان دروست دەکەیت. ئەم وانەیە **دروستکردن** (Create) و **خوێندنەوە** (Read) دەگرێتەوە.

## بەرنامەکە چۆن کار دەکات

```text
 Browser                         Flask                      PostgreSQL
 ───────                         ─────                      ──────────
 GET /            ───────▶  index(): query to-dos   ───▶   SELECT ...
                  ◀───────  HTML page (template)
 fetch POST /todos ──────▶  create_todo(): add + commit ─▶ INSERT ...
   {"description": ...}
                  ◀───────  JSON: the new to-do
```

پەڕەکە بە هەموو کارەکانەوە بار دەبێت کە لەلایەن **قاڵبێکەوە** (template) دروست کراون. زیادکردنی کارێک داواکارییەکی **fetch** بە JSON دەنێرێت، و پەڕەکە بەبێ بارکردنەوە نوێ دەبێتەوە.

## View ـەکان

دڵنیابە کە خشتەی `todos` ـت هەیە (لە وانەی مایگرەیشنەوە). پاشان ئەم import و view ـانە بۆ `app.py` زیاد بکە:

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

سەرنجی ئەم نموونەیە بدە لە `create_todo` دا:

1. سەرەتا داهاتووەکە **بپشکنە** (validate)، و داتای خراپ بە `400` ڕەت بکەرەوە.
2. کاری بنکەدراوەکە **تاقی بکەرەوە** (try).
3. لە کاتی شکستدا، **rollback** بکە و `500` بگەڕێنەرەوە.
4. لە کاتی سەرکەوتندا، ئۆبجێکتە نوێیەکە و `201 Created` بگەڕێنەرەوە.

## قاڵبەکە

Flask لە فۆڵدەرێکی `templates` دا بەدوای قاڵبەکاندا دەگەڕێت. `templates/index.html` دروست بکە:

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

بەشەکانی `{% for %}` و `{{ }}` بریتین لە **Jinja**، زمانی قاڵبی Flask. Jinja خۆکارانە دەق دەپارێزێت (escape)، بۆیە کارێک کە `<script>` ی تێدا بێت وەک دەق پیشان دەدرێت نەک جێبەجێ بکرێت. لە JavaScript دا، `textContent` هەمان کار دەکات.

> دەتوانیت دەقە ئینگلیزییەکانی ناو قاڵبەکە (وەک "My to-dos" و "Add") بگۆڕیت بۆ کوردی. ئەگەر وا بکەیت، `lang="en"` بکە بە `lang="ckb" dir="rtl"`.

## جێبەجێی بکە

```bash
flask --app app run --debug
```

<http://127.0.0.1:5000> بکەرەوە، چەند کارێک زیاد بکە، پاشان پەڕەکە نوێ بکەرەوە: هێشتا لەوێن، چونکە لە PostgreSQL دان. بە `SELECT * FROM todos;` لە `psql` دا بیپشکنە.

> `--debug` کاتێک فایلێک پاشەکەوت دەکەیت ڕاژەکارەکە بار دەکاتەوە و هەڵەی ورد لە وێبگەڕدا پیشان دەدات. **هەرگیز دۆخی debug لەسەر ڕاژەکارێکی گشتی بەکارمەهێنە**: debugger ـەکە دەتوانێت ڕێگە بە سەردانکەران بدات کۆد جێبەجێ بکەن.

## بۆچی JSON دەنێرین لە جیاتی ناردنی فۆڕمەکە؟

ناردنی فۆڕمێکی HTML ـی کلاسیکی هەموو پەڕەکە بار دەکاتەوە. ناردنی JSON بە `fetch` پەڕەکە لە شوێنی خۆی دەهێڵێتەوە و ڕێگە بە ڕاژەکار دەدات تەنها بەو داتایانە وەڵام بداتەوە کە گۆڕاون. ئەمە هەروەها ڕێک ئەو شێوەیەیە کە API ـەکان کاری پێ دەکەن، کە بەشی 3 ی بەرنامەکە دواتر دەچێتە ناوی.

:::quiz
Q: کاتێک وەسفەکە بەتاڵە، `create_todo` دەبێت چ کۆدێکی دۆخ بگەڕێنێتەوە؟
- [ ] 201
- [x] 400
- [ ] 500
Why: 400 Bad Request واتە ڕاژەخوازەکە داتای نادروستی ناردووە. 500 بۆ هەڵەی چاوەڕواننەکراوی ڕاژەکارە، و 201 واتە شتێک دروست کرا.

Q: بۆچی `create_todo` لە بلۆکی `except` دا `db.session.rollback()` بانگ دەکات؟
- [ ] بۆ سڕینەوەی هەموو کارەکان
- [x] بۆ هەڵوەشاندنەوەی مامەڵە شکستخواردووەکە و هێشتنەوەی session بە بەکارهاتوویی
- [ ] بۆ خێراکردنی داواکاریی داهاتوو
Why: دوای هەڵەیەک، session دەبێت rollback بکرێت پێش ئەوەی دووبارە بەکاربهێنرێتەوە.

Q: `e.preventDefault()` لە submit handler ـی فۆڕمەکەدا چی دەکات؟
- [x] ڕێگری لە وێبگەڕ دەکات کە فۆڕمەکە بنێرێت و پەڕەکە بار بکاتەوە
- [ ] ڕێگری لە کاری بەتاڵ دەکات
- [ ] داواکارییەکە بۆ ڕاژەکار بلۆک دەکات
Why: ناردنی بنەڕەتیی فۆڕمی وێبگەڕ هەڵدەوەشێنێتەوە، بۆیە کۆدی `fetch` ـەکەت لە جیاتی ئەو کارەکە دەکات.
:::
