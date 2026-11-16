Knowing **who** sent a request is only half the job. Now your API must decide **what they're allowed to do**. Broken access control is the number one risk on the OWASP Top 10 list of web application security risks, so this lesson matters.

## Permissions and roles

A **permission** is one specific action on one kind of resource. A common naming style is `action:resource`:

```text
get:drinks-detail     post:drinks     patch:drinks     delete:drinks
```

Assigning dozens of permissions to every user individually would be unmanageable. **Role-based access control (RBAC)** groups permissions into **roles**, and gives users roles:

| Role | Permissions |
| --- | --- |
| Customer | none (can see the public menu) |
| Barista | `get:drinks-detail` |
| Manager | `get:drinks-detail`, `post:drinks`, `patch:drinks`, `delete:drinks` |

When someone joins or changes job, you change their role, not a long list of permissions.

## Getting permissions into the token

With an identity provider, you define your API's permissions and roles in its dashboard, assign roles to users, and turn on the setting that adds permissions to access tokens. Tokens then include a claim like:

```json
"permissions": ["get:drinks-detail", "post:drinks"]
```

Your API reads that claim after verifying the token. Because the token is signed, users can't add permissions to it themselves.

## The `requires_auth` decorator

Add these to `auth.py`, below the functions from the authentication lesson:

```python
def check_permission(permission, payload):
    if permission not in payload.get("permissions", []):
        raise AuthError("You don't have permission to do that", 403)


def requires_auth(permission=""):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            token = get_token_from_header()   # 401 if missing or malformed
            payload = verify_token(token)     # 401 if invalid or expired
            if permission:
                check_permission(permission, payload)   # 403 if not allowed
            g.user = payload                  # available to the view
            return f(*args, **kwargs)
        return wrapper
    return decorator
```

Protecting an endpoint is now one line:

```python
from auth import requires_auth

@app.get("/drinks")                       # public
def drinks():
    ...

@app.get("/drinks-detail")
@requires_auth("get:drinks-detail")       # baristas and managers
def drinks_detail():
    ...

@app.delete("/drinks/<int:drink_id>")
@requires_auth("delete:drinks")           # managers only
def delete_drink(drink_id):
    ...
```

The order of decorators matters: the route decorator goes **first** (on top), then `requires_auth`.

### 401 or 403?

| Situation | Status |
| --- | --- |
| No token, malformed header, invalid signature, expired token | **401 Unauthorized** (we don't know who you are) |
| Valid token, but the permission is missing | **403 Forbidden** (we know who you are, and the answer is no) |

## Test it without a real identity provider

You can test authorization logic by signing your own test tokens and pointing `verify_token` at your test key. With `unittest.mock`, you can replace the JWKS lookup in tests:

```python
import time, unittest
from unittest import mock
import jwt
from cryptography.hazmat.primitives.asymmetric import rsa
import auth
from app import create_app

test_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

def make_token(permissions):
    now = int(time.time())
    claims = {"sub": "test-user", "aud": auth.API_AUDIENCE, "iss": f"https://{auth.AUTH_DOMAIN}/",
              "iat": now, "exp": now + 600, "permissions": permissions}
    return jwt.encode(claims, test_key, algorithm="RS256")

class FakeSigningKey:
    key = test_key.public_key()

class AuthTests(unittest.TestCase):
    def setUp(self):
        self.client = create_app().test_client()
        patcher = mock.patch.object(auth.jwks_client, "get_signing_key_from_jwt",
                                    return_value=FakeSigningKey())
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_401_without_token(self):
        self.assertEqual(self.client.delete("/drinks/1").status_code, 401)

    def test_403_with_barista_token(self):
        headers = {"Authorization": "Bearer " + make_token(["get:drinks-detail"])}
        self.assertEqual(self.client.delete("/drinks/1", headers=headers).status_code, 403)
```

(`cryptography` comes from `pip install cryptography`.)

## Rules that prevent real breaches

- **The backend always decides.** Hiding the "Delete" button in the frontend is good design, but it's not security. Anyone can send a `DELETE` request with curl.
- **Check access to the specific object**, not just the action. If users may edit *their own* orders, check that the order's `user_id` matches `g.user["sub"]`. Otherwise changing `/orders/41` to `/orders/42` exposes someone else's data. This flaw is called an **IDOR** (insecure direct object reference).
- **Deny by default.** New endpoints should require authentication unless you deliberately make them public.
- **Least privilege.** Give each role only what it needs.

:::quiz
Q: A barista's valid token tries to delete a drink, which needs `delete:drinks`. What should the API return?
- [ ] 401
- [x] 403
- [ ] 404
Why: The user is authenticated (valid token) but not authorized for this action.

Q: The frontend hides the delete button from baristas. Is the API secure without a permission check?
- [ ] Yes, they can't see the button
- [x] No, anyone can send the request directly, so the backend must check
- [ ] Yes, as long as CORS is configured
Why: Clients can be bypassed or faked. Authorization must be enforced on the server.

Q: What is the main benefit of role-based access control?
- [ ] It removes the need for authentication
- [x] Permissions are grouped into roles, so access is easier to manage and review
- [ ] It makes tokens smaller
Why: Assigning roles instead of individual permissions keeps access consistent as people join, leave or change jobs.
:::
