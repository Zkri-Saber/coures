Your class wants to hold trivia nights, and needs a backend for the game. In this project you'll build a **tested, documented REST API** that manages trivia questions and serves quizzes.

## What you'll build

A Flask API backed by PostgreSQL with these features:

1. List questions, paginated, with their categories
2. Delete a question
3. Add a new question
4. Search questions
5. List the questions in one category
6. Play a quiz: get random questions, optionally from one category, never repeating a question

There's no frontend requirement. You'll test with curl, Postman or Bruno, and with automated tests. (If you've done the web course, building a small frontend is a great stretch goal.)

## The data model

| Model | Fields |
| --- | --- |
| **Category** | `id`, `type` (for example "Science", "History") |
| **Question** | `id`, `question`, `answer`, `category` (a category id), `difficulty` (1 to 5) |

Create a few categories and at least 20 questions as seed data, in a SQL file or a Python seed script, so the API has something to serve.

## Required endpoints

| Method and path | What it does |
| --- | --- |
| `GET /categories` | All categories, as a dictionary of `{id: type}` |
| `GET /questions?page=1` | 10 questions per page, plus the total count and all categories |
| `DELETE /questions/<id>` | Delete one question |
| `POST /questions` | Create a question from `question`, `answer`, `category` and `difficulty` |
| `POST /questions/search` | Questions whose text contains `searchTerm`, case-insensitive |
| `GET /categories/<id>/questions` | Questions in one category |
| `POST /quizzes` | Given `previous_questions` (a list of ids) and `quiz_category`, return one random question that hasn't been asked yet, or none when they run out |

Example quiz request and response:

```bash
curl -X POST http://127.0.0.1:5000/quizzes \
  -H "Content-Type: application/json" \
  -d '{"previous_questions": [4, 12], "quiz_category": {"id": 1, "type": "Science"}}'
```

```json
{
  "success": true,
  "question": { "id": 21, "question": "What is the heaviest organ in the human body?", "answer": "The liver", "category": 1, "difficulty": 4 }
}
```

Decide (and document) how a client asks for questions from **all** categories, for example `"quiz_category": {"id": 0}`.

## Requirements

| Area | Your project meets expectations when... |
| --- | --- |
| **Endpoints** | All required endpoints work, use the correct HTTP methods, and follow REST naming |
| **Responses** | Responses are JSON with a consistent shape (for example a `success` field) and correct status codes |
| **Pagination** | `GET /questions` returns 10 per page and a 404 for pages beyond the end |
| **Errors** | JSON error handlers exist for at least 400, 404, 422 and 500, and the API never returns an HTML error page |
| **CORS** | CORS is configured, with an explanation in the README of which origins are allowed |
| **Tests** | `unittest` tests cover **every endpoint**, with at least one success test **and** one error test each, against a separate test database |
| **Documentation** | The README explains setup, database seeding, running the server and the tests, and documents every endpoint with request parameters, an example response and possible errors |
| **Code quality** | Code is readable, organized (models separate from the app), uses an app factory, and contains no secrets or unused code |

## Suggested steps

1. Create `trivia` and `trivia_test` databases and seed them.
2. Write `models.py` and an app factory in `app.py`, reusing the bookshelf structure.
3. Build one endpoint at a time. For each one: write the test, write the code, check with curl, document it. Don't leave testing and docs to the end.
4. Add the error handlers and their tests.
5. Re-read the requirements table and check each line.
6. Push to GitHub.

### Hints

- For a random unasked question, filter with `Question.id.not_in(previous_questions)`, then pick at random with `random.choice()` on the results, or let PostgreSQL do it with `order_by(func.random()).limit(1)`.
- To return categories as `{id: type}`, use a dictionary comprehension: `{c.id: c.type for c in categories}`.
- Test the quiz endpoint's edge case: what happens when every question has been asked?

## Stretch goals

- Add `GET /questions/<id>` and `PATCH /questions/<id>`
- Add a `rating` field to questions and a way to sort by it
- Add a leaderboard: `POST /scores` and `GET /scores`
- Build a small web page that plays the quiz using your API

## What to submit

1. A link to your **GitHub repository**
2. Your **README** with full API documentation
3. Proof the tests pass: paste the output of `python -m unittest -v` at the end of your README

> Your code must be your own. You may use documentation, tutorials and AI assistants to learn, but you must be able to explain every part of your submission.
