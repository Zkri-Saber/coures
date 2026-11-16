Writing raw SQL for every query gets repetitive, and it mixes two languages in your code. **SQLAlchemy** is Python's most popular database toolkit. Its **ORM** (Object-Relational Mapper) lets you work with rows as ordinary Python objects.

## What an ORM does

| Database | Python with an ORM |
| --- | --- |
| A table, `todos` | A class, `Todo` |
| A row | An object, `Todo(description="Buy milk")` |
| A column | An attribute, `todo.description` |
| `INSERT`, `UPDATE`, `DELETE` | Adding, changing and deleting objects, then committing |

SQLAlchemy has two layers:

- **Core**: builds SQL from Python and manages connections (the **engine**) on top of a DBAPI driver like psycopg.
- **ORM**: maps classes to tables and tracks changes to your objects in a **session**.

**Flask-SQLAlchemy** is a small extension that wires SQLAlchemy into Flask: it creates the engine from your app's config and gives you a session that's cleaned up after every request.

## Connect Flask to PostgreSQL

Create `app.py` in your `todoapp` folder:

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql+psycopg://postgres:postgres@localhost:5432/todoapp"

db = SQLAlchemy(app, model_class=Base)
migrate = Migrate(app, db)  # you'll use this in the Migrations lesson
```

The **database URI** has this shape:

```text
postgresql+psycopg://USER:PASSWORD@HOST:PORT/DATABASE
└──dialect──┘└driver┘
```

> In real projects, don't hard-code passwords. Read the URI from an environment variable, for example `os.environ["DATABASE_URL"]`. You'll learn more in Part 4.

## Define a model

A **model** is a class that describes a table:

```python
class Todo(db.Model):
    __tablename__ = "todos"

    id: Mapped[int] = mapped_column(primary_key=True)
    description: Mapped[str] = mapped_column(String(200))
    completed: Mapped[bool] = mapped_column(default=False)

    def __repr__(self):
        return f"<Todo {self.id}: {self.description}>"
```

- `Mapped[int]` tells SQLAlchemy the Python type, and from it the column type.
- Columns are **required** (`NOT NULL`) by default. Use `Mapped[str | None]` for optional ones.
- `primary_key=True` makes `id` an auto-incrementing primary key.
- `__repr__` makes objects print nicely while you experiment.

## Create the table

For a quick experiment you can create tables straight from your models. Open the Flask shell:

```bash
flask --app app shell
```

```python
>>> db.create_all()
```

`db.create_all()` only creates tables that don't exist yet. It **never changes** existing tables, so once your app has real data, you'll use **migrations** instead (in two lessons' time).

## Add and read data

Still in the shell:

```python
>>> todo = Todo(description="Read chapter 3")
>>> db.session.add(todo)
>>> db.session.commit()
>>> todo.id
1
>>> db.session.execute(db.select(Todo)).scalars().all()
[<Todo 1: Read chapter 3>]
```

Check it really reached the database. In `psql`, run `SELECT * FROM todos;` and your row is there.

:::quiz
Q: In an ORM, what does a model class usually represent?
- [ ] A single row
- [x] A database table
- [ ] A database server
Why: The class maps to a table, and each instance of the class maps to a row.

Q: Your table already has data and you add a new column to the model. What does `db.create_all()` do?
- [ ] Adds the new column to the existing table
- [x] Nothing to that table, because it only creates tables that don't exist
- [ ] Deletes the table and creates it again
Why: `create_all()` never alters existing tables. Schema changes need migrations.

Q: Which part of `postgresql+psycopg://postgres:secret@localhost:5432/todoapp` names the database?
- [ ] `postgresql`
- [ ] `localhost`
- [x] `todoapp`
Why: The database name comes last, after the host and port.
:::
