Now that you can define models, let's master the two things you'll do constantly: **querying** data and **changing** it. Run these examples in `flask --app app shell` after adding a few to-dos.

## Selecting data

Queries are built with `db.select()` and run with `db.session.execute()`. Use `.scalars()` to get model objects back.

```python
# All to-dos, in order
todos = db.session.execute(db.select(Todo).order_by(Todo.id)).scalars().all()

# Filter by exact values
open_todos = db.session.execute(
    db.select(Todo).filter_by(completed=False)
).scalars().all()

# Filter with expressions: comparisons, LIKE, and more
milk = db.session.execute(
    db.select(Todo).where(Todo.description.ilike("%milk%"))
).scalars().all()

# Newest two
latest = db.session.execute(
    db.select(Todo).order_by(Todo.id.desc()).limit(2)
).scalars().all()

# Just the first match, or None
first = db.session.execute(db.select(Todo).filter_by(completed=True)).scalars().first()
```

Some handy shortcuts:

| You want | Code |
| --- | --- |
| One row by primary key (or `None`) | `db.session.get(Todo, 2)` |
| One row by primary key, or a 404 page in a view | `db.get_or_404(Todo, 2)` |
| Count rows | `db.session.execute(db.select(func.count()).select_from(Todo)).scalar()` |
| Case-insensitive search | `.where(Todo.description.ilike("%term%"))` |
| Several conditions | `.where(Todo.completed == False, Todo.priority > 1)` |

(`func` comes from `from sqlalchemy import func`.)

### You'll also see `Model.query`

Older tutorials use a different style:

```python
Todo.query.filter_by(completed=True).all()
Todo.query.get(2)
```

This **legacy query interface** still works, but SQLAlchemy and Flask-SQLAlchemy now recommend `db.session.execute(db.select(...))`, which is what we use. Recognise the old style, but write the new one.

## Changing data

```python
# Update: change the attribute, then commit
todo = db.session.get(Todo, 2)
todo.completed = True
db.session.commit()

# Delete
db.session.delete(todo)
db.session.commit()
```

You never write `UPDATE` or `DELETE` yourself. The session notices what changed and generates the SQL when you commit.

## The session and the object lifecycle

The **session** is a workspace that tracks the objects you're working with. It saves changes to the database in one **transaction** when you call `commit()`, or throws them away with `rollback()`.

An object moves through these states:

| State | Meaning | How it gets there |
| --- | --- | --- |
| **Transient** | A Python object the database doesn't know about | `todo = Todo(description="Water plants")` |
| **Pending** | Added to the session but not yet written to the database | `db.session.add(todo)` |
| **Persistent** | Stored in the database and tracked by the session | After `db.session.flush()` or `commit()` |
| **Detached** | Was in the database, but is no longer tracked by a session | After the session closes, e.g. at the end of a request |

Try it with `sqlalchemy.inspect`:

```python
>>> from sqlalchemy import inspect
>>> todo = Todo(description="Water plants")
>>> inspect(todo).transient
True
>>> db.session.add(todo)
>>> inspect(todo).pending, todo.id
(True, None)
>>> db.session.flush()          # sends the INSERT, but doesn't commit yet
>>> todo.id
4
>>> db.session.commit()
>>> inspect(todo).persistent
True
```

`flush()` sends pending SQL to the database inside the current transaction (that's how `todo.id` gets a value) without making it permanent. `commit()` flushes and makes everything permanent.

## Always handle failures

If a commit fails, the session is left in a broken state until you roll back. In views, use this pattern:

```python
try:
    db.session.add(todo)
    db.session.commit()
except Exception:
    db.session.rollback()
    raise
```

:::quiz
Q: Which line gets all to-dos that aren't completed?
- [x] `db.session.execute(db.select(Todo).filter_by(completed=False)).scalars().all()`
- [ ] `db.session.get(Todo, completed=False)`
- [ ] `Todo.completed == False`
Why: `select` builds the query, `filter_by` adds the condition, and `scalars().all()` returns the matching objects.

Q: You've called `db.session.add(todo)` but not `commit()`. What state is `todo` in?
- [ ] Transient
- [x] Pending
- [ ] Detached
Why: Added to the session but not yet written to the database is the pending state.

Q: A `commit()` raised an error. What should you do before using the session again?
- [ ] Call `commit()` again
- [x] Call `db.session.rollback()`
- [ ] Restart PostgreSQL
Why: After a failed commit, the session must be rolled back to return to a usable state.
:::
