You're starting a challenging journey. Every developer, at every level, gets stuck several times a day. What separates good developers is not that they never get stuck, but that they know **how to get unstuck**.

## Step 1: Read the error message

Python error messages look scary, but they're trying to help. Read a **traceback** from the **bottom up**:

```text
Traceback (most recent call last):
  File "/home/sara/todo/app.py", line 24, in create_todo
    todo = Todo(descripton=data["description"])
TypeError: 'descripton' is an invalid keyword argument for Todo
```

- The **last line** says what went wrong: a misspelled argument, `descripton`.
- The line above it shows **where**: `app.py`, line 24.

Most bugs are typos, a missing import, or a value that isn't what you expected.

## Step 2: Investigate

- **Reproduce it.** Can you make the error happen again on purpose?
- **Print things.** Add `print(data)` or `app.logger.info(data)` to see what a variable really contains.
- **Shrink the problem.** Comment out code until the error disappears. The last thing you removed is the suspect.
- **Explain it out loud** to a friend, or even a rubber duck. Describing what *should* happen, line by line, often reveals the mistake.
- **Take a break.** A ten-minute walk solves a surprising number of bugs.

## Step 3: Search effectively

Search for the **error message itself**, minus the parts specific to you (file names, variable names):

```text
sqlalchemy "is an invalid keyword argument"
```

Trust these sources first:

- The official documentation for [Flask](https://flask.palletsprojects.com), [SQLAlchemy](https://docs.sqlalchemy.org) and [PostgreSQL](https://www.postgresql.org/docs/)
- Stack Overflow answers with a recent date and many votes
- The project's GitHub issues, for bugs in the library itself

Check the **version**: an answer written for Flask 1 or SQLAlchemy 1.3 may not work with today's versions.

## Step 4: Ask a great question

If you've spent 30 to 45 minutes and you're still stuck, ask your teacher or classmates. A good question gets a fast answer. Include:

1. **What you're trying to do:** "I'm trying to save a new to-do item."
2. **What happened:** the full error message, as text, not a photo of your screen.
3. **The relevant code**, as small as you can make it.
4. **What you've already tried:** "I checked the spelling of the column names and printed `data`."

## Using AI assistants

AI tools can explain errors and concepts well. Use them like a tutor, not a ghostwriter:

- Ask "*why* is this happening?" rather than "fix my code".
- Check that the answer matches the versions you're using.
- **Your project submissions must be your own work.** You must be able to explain every line you submit.

:::quiz
Q: Where do you look first in a Python traceback?
- [ ] The first line
- [x] The last line, which names the error, then the line just above it
- [ ] The middle
Why: Tracebacks list the most recent call last, so the bottom shows the actual error and where it happened.

Q: Which question is most likely to get a quick, useful answer?
- [ ] "My app doesn't work, help!"
- [ ] A photo of your screen with no explanation
- [x] What you're trying to do, the full error text, a small code sample, and what you've already tried
Why: Giving context and evidence lets the helper understand the problem without a long back-and-forth.
:::
