Your data model will change many times during a project: new columns, new tables, renamed fields. But `db.create_all()` can't change existing tables, and dropping tables would lose real data. **Migrations** solve this.

## What is a migration?

A migration is a small Python file that describes **one change** to the database schema, with two functions:

- `upgrade()` applies the change
- `downgrade()` undoes it

Migrations are stored in your project and committed to Git, so the database structure has **version control** just like your code. Everyone on the team, and your production server, can apply the same changes in the same order.

**Alembic** is the migration tool for SQLAlchemy, and **Flask-Migrate** connects it to Flask's command line. You already added `migrate = Migrate(app, db)` to `app.py`.

## The workflow

```bash
flask --app app db init                       # once per project: creates the migrations/ folder
flask --app app db migrate -m "create todos table"   # generate a migration from your models
flask --app app db upgrade                    # apply it to the database
```

If you created the `todos` table with `create_all()` in the last lesson, drop it first in `psql` (`DROP TABLE todos;`) so migrations can manage it from the start.

Every time you change your models after that:

1. Edit the model in `app.py`
2. `flask --app app db migrate -m "describe the change"`
3. **Open the new file in `migrations/versions/` and read it**
4. `flask --app app db upgrade`
5. Commit the migration file to Git

Other useful commands:

| Command | What it does |
| --- | --- |
| `flask --app app db downgrade` | Undo the most recent migration |
| `flask --app app db current` | Show which migration the database is on |
| `flask --app app db history` | List all migrations in order |

## Example: add a column to a table that has data

Let's give to-dos a priority. Add one line to the model:

```python
class Todo(db.Model):
    __tablename__ = "todos"

    id: Mapped[int] = mapped_column(primary_key=True)
    description: Mapped[str] = mapped_column(String(200))
    completed: Mapped[bool] = mapped_column(default=False)
    priority: Mapped[int] = mapped_column(default=1, server_default="1")
```

Generate the migration:

```bash
flask --app app db migrate -m "add priority to todos"
```

Alembic compares your models with the database and writes:

```python
def upgrade():
    with op.batch_alter_table('todos', schema=None) as batch_op:
        batch_op.add_column(sa.Column('priority', sa.Integer(), server_default='1', nullable=False))

def downgrade():
    with op.batch_alter_table('todos', schema=None) as batch_op:
        batch_op.drop_column('priority')
```

Why `server_default="1"`? The column is required (`NOT NULL`), but the table already has rows. `default=1` only applies to new objects created in Python; `server_default` tells **the database** what to put in existing rows. Without it, the upgrade would fail.

Run `flask --app app db upgrade`, then check in `psql`: every existing to-do now has `priority = 1`.

## Rules for safe migrations

- **Always read generated migrations.** Autogenerate is helpful but not perfect. It can't detect a renamed column, for example: it sees a dropped column and a new one, which would lose the data.
- **Never edit a migration that's already been applied** on a shared database. Create a new one instead.
- **Think about existing rows** whenever you add a required column. You'll handle a trickier case in the next CRUD lesson.
- **Test `downgrade()`** too, so you can back out of a bad change.

:::quiz
Q: Why use migrations instead of `db.create_all()`?
- [ ] Migrations make queries faster
- [x] They change existing tables safely and keep a versioned history of schema changes
- [ ] `create_all()` only works with SQLite
Why: Migrations apply schema changes step by step without losing data, and the files live in version control.

Q: What should you do right after `flask db migrate`?
- [ ] Delete the migrations folder
- [x] Open and read the generated migration file before upgrading
- [ ] Run `db.create_all()`
Why: Autogenerate can miss or misread changes, such as renames. Always review the file.

Q: You add a required column to a table with existing rows. What prevents the upgrade from failing?
- [ ] Setting `default=` in Python only
- [x] Giving the column a `server_default`, or filling existing rows in the migration
- [ ] Running the upgrade twice
Why: Existing rows need a value in the database itself. A Python-side default doesn't apply to them.
:::
