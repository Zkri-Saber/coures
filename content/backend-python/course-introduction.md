Almost every useful web application stores data: users, posts, orders, messages, bookings. In this course you'll learn to build a **database-backed web application** from the ground up.

## The stack you'll work with

```text
 Browser  ──HTTP──▶  Flask app  ──Python objects──▶  SQLAlchemy  ──SQL──▶  PostgreSQL
 (HTML,     ◀─────   (routes,    ◀────────────────   (ORM)        ◀─────   (database)
  JS)                 views)
```

- **PostgreSQL** stores the data in tables.
- **SQLAlchemy** lets you work with that data as Python objects instead of writing raw SQL for everything.
- **Flask** receives requests from the browser, uses SQLAlchemy to read or change data, and sends back a response.

## What you'll learn

By the end of this course you'll be able to:

- Connect to a database from Python and run SQL safely
- Define your data as **models**, and the **relationships** between them
- Perform **CRUD** operations, meaning Create, Read, Update and Delete, across both the database and the web app
- Change your database structure over time with **migrations**
- Think through good **data modeling** principles: what tables you need, and how they connect

## The roadmap

| Lesson | You'll be able to... |
| --- | --- |
| Set up your environment | Run Python and PostgreSQL on your computer |
| Interacting with databases | Talk to PostgreSQL from the terminal and from Python |
| SQLAlchemy basics | Define models and create tables |
| SQLAlchemy ORM in depth | Query and change data, and understand sessions |
| Migrations | Change the schema without losing data |
| CRUD app, parts 1 and 2 | Build a complete to-do app with lists |
| **Project** | Build an artist booking site |

Throughout the course you'll build one app step by step: a **to-do app** with multiple lists. Keep it in a GitHub repository and commit after each lesson.

:::quiz
Q: In this stack, what is SQLAlchemy's job?
- [ ] Storing the data on disk
- [x] Letting your Python code work with database data as objects
- [ ] Showing pages in the browser
Why: SQLAlchemy is an ORM, a layer between your Python code and the database that turns rows into objects and object changes into SQL.

Q: What does CRUD stand for?
- [x] Create, Read, Update, Delete
- [ ] Connect, Run, Upload, Download
- [ ] Code, Review, Upgrade, Deploy
Why: These four operations cover almost everything an app does with stored data.
:::
