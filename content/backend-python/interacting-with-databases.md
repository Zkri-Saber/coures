Before using an ORM, you need to understand what it does for you. In this lesson you'll talk to PostgreSQL directly: first in its own terminal, then from Python.

## The client-server model

A database server like PostgreSQL runs as a separate program, often on a different machine. Anything that connects to it is a **client**: the `psql` terminal, a graphical tool, or your Flask app.

```text
 client (psql, your app)  ──query──▶  PostgreSQL server  ──▶  data on disk
                          ◀─results──
```

Many clients can connect at once, and the server keeps the data consistent for all of them.

## Relational databases in one minute

- Data lives in **tables**, made of **rows** (records) and **columns** (fields).
- Each table has a **primary key**: a column that uniquely identifies every row, usually `id`.
- A **foreign key** is a column that points to a primary key in another table. That's how tables relate to each other.

```text
todolists                     todos
+----+----------+             +----+-----------------+-----------+---------+
| id | name     |             | id | description     | completed | list_id |
+----+----------+             +----+-----------------+-----------+---------+
| 1  | Homework | ◀─────────  | 1  | Read chapter 3  | false     | 1       |
| 2  | Shopping |             | 2  | Buy milk        | true      | 2       |
+----+----------+             +----+-----------------+-----------+---------+
```

## SQL review

Open `psql`, connect to your database (`\c todoapp`), and try these:

```sql
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    description VARCHAR(200) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false
);

INSERT INTO todos (description) VALUES ('Read chapter 3'), ('Buy milk');

SELECT * FROM todos WHERE completed = false ORDER BY id;

UPDATE todos SET completed = true WHERE id = 2;

DELETE FROM todos WHERE id = 1;
```

Useful `psql` commands (they start with a backslash and don't need a semicolon):

| Command | What it does |
| --- | --- |
| `\l` | List databases |
| `\c todoapp` | Connect to a database |
| `\dt` | List tables |
| `\d todos` | Describe a table's columns |
| `\q` | Quit |

## Talking to PostgreSQL from Python

Python programs talk to databases through a **DBAPI driver**, a library that follows Python's standard database interface. For PostgreSQL, the modern driver is **psycopg** (version 3). You'll also see its older sibling, `psycopg2`, in many tutorials; they work almost the same way.

```python
import psycopg

with psycopg.connect("host=localhost dbname=todoapp user=postgres password=postgres") as conn:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO todos (description) VALUES (%s)",
            ("Practice SQL",),
        )
        cur.execute("SELECT id, description, completed FROM todos ORDER BY id")
        for row in cur.fetchall():
            print(row)
# Leaving the "with conn" block commits the transaction (or rolls it back on an error)
```

- A **connection** is your session with the server.
- A **cursor** sends queries and reads results.
- A **transaction** groups changes so they're saved together with a commit, or undone together with a rollback.

## Never build SQL with string formatting

Always pass values as **parameters** (the `%s` placeholders plus a tuple of values). Never do this:

```python
# DANGEROUS: never do this
cur.execute(f"SELECT * FROM users WHERE name = '{name}'")
```

If `name` is `x' OR '1'='1`, the query returns every user. This attack is called **SQL injection**, and it's one of the most common security holes on the web. With parameters, the driver sends values separately from the SQL, so they can never change the query's meaning.

:::quiz
Q: What is a foreign key?
- [ ] A key that unlocks a database from another country
- [x] A column that refers to the primary key of another table
- [ ] An encrypted password column
Why: Foreign keys link rows across tables, for example each to-do's `list_id` points to a row in `todolists`.

Q: Which line runs a query safely?
- [ ] `cur.execute(f"SELECT * FROM todos WHERE id = {todo_id}")`
- [ ] `cur.execute("SELECT * FROM todos WHERE id = " + todo_id)`
- [x] `cur.execute("SELECT * FROM todos WHERE id = %s", (todo_id,))`
Why: Passing values as parameters prevents SQL injection, because the driver never mixes data into the SQL text.

Q: What does committing a transaction do?
- [x] Saves all the changes made in the transaction permanently
- [ ] Closes the database server
- [ ] Undoes all changes since the last query
Why: Commit makes the changes permanent. Rollback is the opposite: it undoes them.
:::
