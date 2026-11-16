Your app can create and read to-dos. Now you'll add **Update** and **Delete**, and organise to-dos into **lists**, which means modeling your first **relationship**.

## Update and delete

Add these views to `app.py`:

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

- `<int:todo_id>` captures the number in the URL and passes it to your function.
- `PATCH` means "change part of this resource". `DELETE` means "remove it".
- `db.get_or_404` returns a 404 Not Found response automatically if the to-do doesn't exist.

## Model a one-to-many relationship

One list has **many** to-dos; each to-do belongs to **one** list. In the database, that's a foreign key on the "many" side:

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

- `ForeignKey("todolists.id")` creates the real link in the database.
- `relationship()` adds handy Python attributes on both sides: `my_list.todos` gives a list of to-dos, and `todo.todo_list` gives the list it belongs to. `back_populates` keeps the two sides in sync.
- `cascade="all, delete-orphan"` means deleting a list also deletes its to-dos, instead of leaving them pointing at nothing.

## Migrate, carefully

Generate the migration:

```bash
flask --app app db migrate -m "add todo lists"
```

If you run `upgrade` straight away, it fails:

```text
psycopg.errors.NotNullViolation: column "list_id" of relation "todos" contains null values
```

Your existing to-dos have no list, but the new column is required. Edit the generated migration so it moves existing rows into a default list:

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

This "add nullable, fill in, then make required" pattern is how professionals change live databases. Run `flask --app app db upgrade`, then test `downgrade` and `upgrade` again to be sure both directions work.

## Views for lists

Replace your `index` view and update `create_todo` so new to-dos join a list:

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

## The updated template

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

Add a little CSS in the `<head>` so completed items look done:

```html
<style>
  .done label { text-decoration: line-through; color: #888; }
</style>
```

## Try it yourself

1. Create a second list in the Flask shell: `db.session.add(TodoList(name="Shopping")); db.session.commit()`
2. Switch between lists, add to-dos to each, tick them off and delete them.
3. **Challenge:** add a form and a `POST /lists` view to create lists from the page.

:::quiz
Q: In a one-to-many relationship between lists and to-dos, where does the foreign key go?
- [ ] On the `todolists` table
- [x] On the `todos` table (the "many" side)
- [ ] In a separate settings table
Why: Each to-do stores which list it belongs to, so `todos.list_id` points to `todolists.id`.

Q: What does `cascade="all, delete-orphan"` do here?
- [x] Deleting a list also deletes its to-dos
- [ ] Deleting a to-do also deletes its list
- [ ] Prevents lists from being deleted
Why: The cascade is set on the list's `todos` relationship, so the list's children are removed with it.

Q: Why did the migration add `list_id` as nullable first?
- [ ] Foreign keys must always be nullable
- [x] Existing rows had no value yet; the migration filled them in before making the column required
- [ ] To make queries faster
Why: You can't add a required column to rows that have no value. Add it as nullable, fill it, then tighten the rule.
:::
