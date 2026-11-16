Musicians need places to play, and venues need musicians to fill their calendars. In this project you'll build the backend of a **booking site** where venues and artists can list themselves and schedule **shows** together.

This project shows you can design a relational data model, build it with SQLAlchemy and migrations, and connect it to a working Flask web app.

## What you'll build

A Flask web app with HTML pages (Jinja templates) backed by PostgreSQL, where users can:

- **List** all venues, grouped by city and state, and all artists
- **View** a venue or artist page that shows their details and their **upcoming** and **past** shows, with counts
- **Create** new venues, artists and shows through forms
- **Search** venues and artists by name: partial and case-insensitive, so `"hop"` finds "The Musical **Hop**" and "Park Square Live Music & Coffee" doesn't match
- **Edit** a venue and an artist
- **Delete** a venue (stretch goal)

You choose the page design. Plain, clean HTML is completely fine: this project is graded on the backend.

## The data model

Plan this carefully before writing code. You'll need at least:

| Model | Suggested fields |
| --- | --- |
| **Venue** | name, city, state, address, phone, genres, image link, website link, Facebook link, seeking talent (true/false), seeking description |
| **Artist** | name, city, state, phone, genres, image link, website link, Facebook link, seeking venue (true/false), seeking description |
| **Show** | venue, artist, start time |

A show connects one artist to one venue at a specific time. An artist plays many shows and a venue hosts many shows, so **Show** is its own table with two foreign keys:

```text
venues ◀─── shows ───▶ artists
  1     many  │  many    1
              └─ start_time
```

Think about:

- Which fields are **required**, and which are optional?
- How will you store **genres** (a venue or artist can have several)? Options include a PostgreSQL `ARRAY` column, or a separate `genres` table with a many-to-many relationship. Either is acceptable if you can explain your choice in the README.
- What should happen to shows when a venue is deleted?

## Requirements

| Area | Your project meets expectations when... |
| --- | --- |
| **Data model** | Models are normalized, with proper primary and foreign keys and relationships, and no data duplicated between tables without a reason |
| **Migrations** | The schema is created and changed **only** through Flask-Migrate migrations, all committed to Git. No `db.create_all()` in the app |
| **Real data** | Every page reads from and writes to the database. No hard-coded sample data in views or templates |
| **Create** | New venues, artists and shows can be created through forms, saved with SQLAlchemy, and show a success or error message |
| **Read** | List pages and detail pages work. Detail pages separate upcoming and past shows using the current time, with counts |
| **Search** | Search is partial and case-insensitive, and shows the number of results |
| **Update** | A venue and an artist can be edited, with existing values pre-filled in the form |
| **Errors** | Database work is wrapped in try/except with rollback. Missing records show a 404 page |
| **Code quality** | Code is organized, consistently formatted and readable, with no unused code or secrets committed |
| **README** | Explains what the project is, how to install it, create the database, run migrations and start the app |

## Suggested steps

1. **Draw your schema** on paper or a whiteboard first. Check it with a classmate.
2. Set up the project: virtual environment, `requirements.txt`, `.gitignore`, a PostgreSQL database.
3. Write the models, then `flask db init`, `migrate` and `upgrade`.
4. Build **create** forms first, so you have data to display.
5. Build the list and detail pages. Use queries to split upcoming and past shows; don't loop over every show in Python.
6. Add search, then editing, then deleting.
7. Test everything by hand, including error cases: an empty form, a venue that doesn't exist, a show for an artist who doesn't exist.
8. Write the README and push to GitHub.

### Helpful snippets

Splitting upcoming and past shows for a venue:

```python
from datetime import datetime

now = datetime.now()
upcoming = db.session.execute(
    db.select(Show).where(Show.venue_id == venue.id, Show.start_time > now).order_by(Show.start_time)
).scalars().all()
past = db.session.execute(
    db.select(Show).where(Show.venue_id == venue.id, Show.start_time <= now).order_by(Show.start_time.desc())
).scalars().all()
```

Case-insensitive partial search:

```python
term = request.form.get("search_term", "")
results = db.session.execute(
    db.select(Venue).where(Venue.name.ilike(f"%{term}%"))
).scalars().all()
```

Using an f-string inside `ilike()` is safe: SQLAlchemy still sends the value as a parameter. The danger is only in building **raw SQL text** yourself.

## Stretch goals

- Delete a venue or artist from its page
- Show "Recently listed" artists and venues on the home page
- Search by city and state, for example `"San Francisco, CA"`
- Let artists set the times they're available, and prevent booking outside them
- Use Flask-WTF for forms with validation and CSRF protection

## What to submit

1. A link to your **GitHub repository**, including the `migrations` folder
2. A **README** with setup and run instructions
3. Optional: a short screen recording of the app working

> Your code must be your own. You may use documentation, tutorials and AI assistants to learn, but you must be able to explain every part of your submission.
