A local coffee shop is launching a digital menu. Customers can browse drinks, baristas can see the full recipes, and managers can create and change drinks. Your job: build the **secure backend**, with authentication through an identity provider and **role-based access control**.

## What you'll build

A Flask API with a database of drinks, where each endpoint is protected according to who's calling it.

### The data model

| Field | Type | Notes |
| --- | --- | --- |
| `id` | integer | Primary key |
| `title` | string | Unique, for example "Flat white" |
| `recipe` | JSON list | Ingredients, each with `name`, `color` and `parts`, e.g. `[{"name": "milk", "color": "white", "parts": 2}]` |

Give the model two methods:

- `short()`: the drink with recipe **colors and parts only**, for the public menu
- `long()`: the drink with the **full recipe**, including ingredient names

### Roles and permissions

| Role | Permissions |
| --- | --- |
| Public (no login) | none |
| Barista | `get:drinks-detail` |
| Manager | `get:drinks-detail`, `post:drinks`, `patch:drinks`, `delete:drinks` |

### Endpoints

| Method and path | Permission | Returns |
| --- | --- | --- |
| `GET /drinks` | public | `{"success": true, "drinks": [...]}` using `short()` |
| `GET /drinks-detail` | `get:drinks-detail` | all drinks using `long()` |
| `POST /drinks` | `post:drinks` | the new drink, using `long()` |
| `PATCH /drinks/<id>` | `patch:drinks` | the updated drink, using `long()` |
| `DELETE /drinks/<id>` | `delete:drinks` | `{"success": true, "delete": id}` |

## Set up your identity provider

Use any provider that issues RS256 JWT access tokens and supports RBAC; Auth0's free plan is a common choice. In your provider's dashboard:

1. **Create an API** with an identifier (the **audience**), for example `coffee-api`, and RS256 signing.
2. **Turn on RBAC** for the API and the option to **add permissions to the access token**.
3. **Create the four permissions** listed above.
4. **Create two roles**, Barista and Manager, and assign their permissions.
5. **Create two test users** and give each one a role.
6. **Get an access token** for each user (most providers offer a test login or a way to get tokens for testing). Paste one into [jwt.io](https://jwt.io) to check the `permissions` claim is there.

Put your provider domain and audience in environment variables, not in your code.

## Requirements

| Area | Your project meets expectations when... |
| --- | --- |
| **Token handling** | `auth.py` reads the `Authorization: Bearer` header, verifies the RS256 signature with the provider's public keys, and checks expiry, audience and issuer |
| **Permissions** | A `requires_auth(permission)` decorator checks the `permissions` claim, and every endpoint uses the right permission |
| **Status codes** | Missing, malformed, invalid or expired tokens return **401**; valid tokens without the permission return **403** |
| **Endpoints** | All five endpoints work as specified, with `short()` and `long()` used correctly |
| **Errors** | JSON error handlers exist for 400, 401, 403, 404, 422 and 500, plus a handler for your `AuthError` |
| **Validation** | `POST` and `PATCH` reject missing or badly formed titles and recipes with a 400 or 422 |
| **Tests** | Automated tests, or an exported Postman or Bruno collection, prove each role gets the right result on every endpoint, including 401 and 403 cases |
| **Security** | No secrets in the repository; CORS limited to the origins that need it; debug mode off by default |
| **README** | Explains setup, environment variables, roles and permissions, how to get test tokens, and documents every endpoint |

## Suggested steps

1. Build the model and all five endpoints **without** authentication first, and test them with curl.
2. Set up the identity provider, roles and users.
3. Write `auth.py`, following the authentication and authorization lessons.
4. Add `@requires_auth(...)` to each endpoint, then test every role on every endpoint:

| | Public | Barista | Manager |
| --- | --- | --- | --- |
| `GET /drinks` | 200 | 200 | 200 |
| `GET /drinks-detail` | 401 | 200 | 200 |
| `POST /drinks` | 401 | 403 | 201 or 200 |
| `PATCH /drinks/1` | 401 | 403 | 200 |
| `DELETE /drinks/1` | 401 | 403 | 200 |

5. Write the README and push to GitHub.

### Hints

- Store the recipe in a `JSON` column (`from sqlalchemy import JSON`) or as a JSON string in a text column.
- Tokens expire, often after a few hours. If tests suddenly fail with 401, get a fresh token.
- To test without network access, use the mocking approach from the authorization lesson.

## Stretch goals

- Add a **Dockerfile** so the API runs with `docker build` and `docker run`, serving the app with Gunicorn
- Add `docker-compose.yml` to start the API and PostgreSQL together
- Rate-limit write endpoints with Flask-Limiter
- Log every 401 and 403 with the time, endpoint and user id (never the token)

## What to submit

1. A link to your **GitHub repository**
2. Your **README** with setup steps and API documentation
3. Your tests, or your exported Postman or Bruno collection, with **expired or placeholder tokens only**

> Never commit real, valid tokens or secrets. Your code must be your own, and you must be able to explain every part of your submission.
