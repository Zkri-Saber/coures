بەرنامەکەت دەتوانێت کار دروست بکات و بیخوێنێتەوە. ئێستا **نوێکردنەوە** (Update) و **سڕینەوە** (Delete) زیاد دەکەیت، و کارەکان لە **لیستەکاندا** ڕێک دەخەیت، کە واتە مۆدێلکردنی یەکەم **پەیوەندیت** (relationship).

## نوێکردنەوە و سڕینەوە

ئەم view ـانە بۆ `app.py` زیاد بکە:

```python
@app.patch("/todos/<int:todo_id>")
def update_todo(todo_id):
    todo = db.get_or_404(Todo, todo_id)
    data = request.get_json(silent=True) or {}
    try:
        if "completed" in data:
            todo.completed = bool(data["completed"])
        db.session.commit()
        return jsonify(id=todo.id, completed=todo.completed)
    except Exception:
        db.session.rollback()
        abort(500)


@app.delete("/todos/<int:todo_id>")
def delete_todo(todo_id):
    todo = db.get_or_404(Todo, todo_id)
    try:
        db.session.delete(todo)
        db.session.commit()
        return jsonify(success=True)
    except Exception:
        db.session.rollback()
        abort(500)
```

- `<int:todo_id>` ژمارەکەی ناو URL ـەکە دەگرێت و دەیدات بە فەنکشنەکەت.
- `PATCH` واتە "بەشێک لەم سەرچاوەیە بگۆڕە". `DELETE` واتە "لای ببە".
- `db.get_or_404` ئەگەر کارەکە بوونی نەبێت خۆکارانە وەڵامێکی 404 Not Found دەگەڕێنێتەوە.

## مۆدێلکردنی پەیوەندیی یەک-بۆ-زۆر

یەک لیست **زۆر** کاری هەیە؛ هەر کارێک سەر بە **یەک** لیستە. لە بنکەدراوەدا، ئەمە کلیلێکی بیانییە لە لای "زۆر"ـەکەدا:

```python
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class TodoList(db.Model):
    __tablename__ = "todolists"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    todos: Mapped[list["Todo"]] = relationship(
        back_populates="todo_list", cascade="all, delete-orphan", order_by="Todo.id"
    )


class Todo(db.Model):
    __tablename__ = "todos"

    id: Mapped[int] = mapped_column(primary_key=True)
    description: Mapped[str] = mapped_column(String(200))
    completed: Mapped[bool] = mapped_column(default=False)
    priority: Mapped[int] = mapped_column(default=1, server_default="1")
    list_id: Mapped[int] = mapped_column(ForeignKey("todolists.id"))
    todo_list: Mapped["TodoList"] = relationship(back_populates="todos")
```

- `ForeignKey("todolists.id")` بەستەرە ڕاستەقینەکە لە بنکەدراوەدا دروست دەکات.
- `relationship()` تایبەتمەندیی بەسوودی پایتۆن بۆ هەردوو لا زیاد دەکات: `my_list.todos` لیستێک لە کارەکان دەدات، و `todo.todo_list` ئەو لیستە دەدات کە سەری پێیەتی. `back_populates` هەردوو لا هاوکات دەهێڵێتەوە.
- `cascade="all, delete-orphan"` واتە سڕینەوەی لیستێک کارەکانیشی دەسڕێتەوە، لە جیاتی ئەوەی بە ئاماژەکردن بۆ هیچ شتێک بیانهێڵێتەوە.

## مایگرەیشن، بە وریاییەوە

مایگرەیشنەکە دروست بکە:

```bash
flask --app app db migrate -m "add todo lists"
```

ئەگەر دەستبەجێ `upgrade` جێبەجێ بکەیت، شکست دەهێنێت:

```text
psycopg.errors.NotNullViolation: column "list_id" of relation "todos" contains null values
```

کارە هەبووەکانت هیچ لیستێکیان نییە، بەڵام ستوونە نوێیەکە پێویستە. مایگرەیشنە دروستکراوەکە دەستکاری بکە تا ڕیزە هەبووەکان بگوازێتەوە بۆ لیستێکی بنەڕەتی:

```python
def upgrade():
    # 1. Create the new table
    op.create_table(
        "todolists",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    # 2. Make a default list for the to-dos that already exist
    op.execute("INSERT INTO todolists (name) VALUES ('My first list')")

    with op.batch_alter_table("todos", schema=None) as batch_op:
        # 3. Add the column as nullable first, so existing rows are allowed
        batch_op.add_column(sa.Column("list_id", sa.Integer(), nullable=True))

    # 4. Put every existing to-do into the default list
    op.execute("UPDATE todos SET list_id = (SELECT MIN(id) FROM todolists)")

    with op.batch_alter_table("todos", schema=None) as batch_op:
        # 5. Now that every row has a value, make it required and add the foreign key
        batch_op.alter_column("list_id", existing_type=sa.Integer(), nullable=False)
        batch_op.create_foreign_key("fk_todos_list_id", "todolists", ["list_id"], ["id"])


def downgrade():
    with op.batch_alter_table("todos", schema=None) as batch_op:
        batch_op.drop_constraint("fk_todos_list_id", type_="foreignkey")
        batch_op.drop_column("list_id")
    op.drop_table("todolists")
```

ئەم نموونەیەی "زیادکردن بە nullable، پڕکردنەوە، پاشان پێویستکردن" ئەو ڕێگایەیە کە پیشەگەران بنکەدراوە زیندووەکانی پێ دەگۆڕن. `flask --app app db upgrade` جێبەجێ بکە، پاشان دووبارە `downgrade` و `upgrade` تاقی بکەرەوە تا دڵنیا بیت هەردوو ئاراستەکە کار دەکەن.

## View ـەکان بۆ لیستەکان

view ـی `index` جێگە بگرەوە و `create_todo` نوێ بکەرەوە تا کارە نوێیەکان بچنە ناو لیستێکەوە:

```python
from flask import redirect, url_for


@app.route("/")
def index():
    first = db.session.execute(db.select(TodoList).order_by(TodoList.id)).scalars().first()
    if first is None:
        first = TodoList(name="My first list")
        db.session.add(first)
        db.session.commit()
    return redirect(url_for("show_list", list_id=first.id))


@app.route("/lists/<int:list_id>")
def show_list(list_id):
    active_list = db.get_or_404(TodoList, list_id)
    lists = db.session.execute(db.select(TodoList).order_by(TodoList.id)).scalars().all()
    return render_template("index.html", lists=lists, active_list=active_list)


@app.post("/todos")
def create_todo():
    data = request.get_json(silent=True) or {}
    description = (data.get("description") or "").strip()
    list_id = data.get("list_id")
    if not description or db.session.get(TodoList, list_id) is None:
        abort(400)
    try:
        todo = Todo(description=description, list_id=list_id)
        db.session.add(todo)
        db.session.commit()
        return jsonify(id=todo.id, description=todo.description, completed=todo.completed), 201
    except Exception:
        db.session.rollback()
        print(sys.exc_info())
        abort(500)
```

## قاڵبە نوێکراوەکە

```html
<nav>
  {% for l in lists %}
    <a href="{{ url_for('show_list', list_id=l.id) }}">{{ l.name }}</a>
  {% endfor %}
</nav>

<h1>{{ active_list.name }}</h1>

<form id="new-todo">
  <input id="description" placeholder="What do you need to do?" required>
  <button>Add</button>
</form>
<p id="error" hidden>Something went wrong. Please try again.</p>

<ul id="todos">
  {% for todo in active_list.todos %}
    <li data-id="{{ todo.id }}" class="{{ 'done' if todo.completed }}">
      <input type="checkbox" id="t{{ todo.id }}" {{ 'checked' if todo.completed }}>
      <label for="t{{ todo.id }}">{{ todo.description }}</label>
      <button class="delete" aria-label="Delete {{ todo.description }}">✕</button>
    </li>
  {% endfor %}
</ul>

<script>
  const listId = {{ active_list.id }};
  const error = document.getElementById("error");

  document.getElementById("new-todo").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("description");
    const res = await fetch("/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: input.value, list_id: listId }),
    });
    if (!res.ok) { error.hidden = false; return; }
    error.hidden = true;
    window.location.reload();
  });

  // Tick a checkbox: update
  document.getElementById("todos").addEventListener("change", async (e) => {
    const li = e.target.closest("li");
    const res = await fetch(`/todos/${li.dataset.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: e.target.checked }),
    });
    if (res.ok) li.classList.toggle("done", e.target.checked);
    else error.hidden = false;
  });

  // Click ✕: delete
  document.getElementById("todos").addEventListener("click", async (e) => {
    if (!e.target.matches(".delete")) return;
    const li = e.target.closest("li");
    const res = await fetch(`/todos/${li.dataset.id}`, { method: "DELETE" });
    if (res.ok) li.remove();
    else error.hidden = false;
  });
</script>
```

کەمێک CSS لە `<head>` دا زیاد بکە تا کارە تەواوکراوەکان وەک تەواوبوو دەربکەون:

```html
<style>
  .done label { text-decoration: line-through; color: #888; }
</style>
```

## خۆت تاقی بکەرەوە

1. لیستێکی دووەم لە Flask shell دا دروست بکە: `db.session.add(TodoList(name="Shopping")); db.session.commit()`
2. لە نێوان لیستەکاندا بگۆڕە، کار بۆ هەر یەکێکیان زیاد بکە، نیشانەیان بکە و بیانسڕەوە.
3. **ئاڵنگاری:** فۆڕمێک و view ـێکی `POST /lists` زیاد بکە بۆ دروستکردنی لیست لە پەڕەکەوە.

:::quiz
Q: لە پەیوەندییەکی یەک-بۆ-زۆر لە نێوان لیست و کارەکاندا، کلیلی بیانی دەچێتە کوێ؟
- [ ] لەسەر خشتەی `todolists`
- [x] لەسەر خشتەی `todos` (لای "زۆر")
- [ ] لە خشتەیەکی ڕێکخستنی جیادا
Why: هەر کارێک هەڵیدەگرێت سەر بە کام لیستە، بۆیە `todos.list_id` ئاماژە بە `todolists.id` دەکات.

Q: `cascade="all, delete-orphan"` لێرەدا چی دەکات؟
- [x] سڕینەوەی لیستێک کارەکانیشی دەسڕێتەوە
- [ ] سڕینەوەی کارێک لیستەکەشی دەسڕێتەوە
- [ ] ڕێگری لە سڕینەوەی لیستەکان دەکات
Why: cascade ـەکە لەسەر پەیوەندیی `todos` ـی لیستەکە دانراوە، بۆیە منداڵەکانی لیستەکە لەگەڵیدا لادەبرێن.

Q: بۆچی مایگرەیشنەکە سەرەتا `list_id` ـی بە nullable زیاد کرد؟
- [ ] کلیلە بیانییەکان دەبێت هەمیشە nullable بن
- [x] ڕیزە هەبووەکان هێشتا بەهایان نەبوو؛ مایگرەیشنەکە پێش پێویستکردنی ستوونەکە پڕی کردنەوە
- [ ] بۆ خێراکردنی پرسیارەکان
Why: ناتوانیت ستوونێکی پێویست بۆ ڕیزگەلێک زیاد بکەیت کە بەهایان نییە. بە nullable زیادی بکە، پڕی بکەرەوە، پاشان یاساکە توند بکە.
:::
