Every request to your API arrives as a stranger. **Authentication** is how your backend works out who sent it. In this lesson you'll learn the main approaches, then implement token checking in Flask.

## Factors of authentication

People prove who they are with one or more **factors**:

| Factor | Examples |
| --- | --- |
| Something you **know** | A password or PIN |
| Something you **have** | Your phone (an authenticator app), a security key |
| Something you **are** | A fingerprint or face |

**Multi-factor authentication (MFA)** combines two or more different factors. It blocks the large majority of account takeovers, because a stolen password alone isn't enough.

## Remembering a logged-in user

HTTP is stateless, so after login, every request must prove who sent it. There are two common approaches.

### Sessions (cookies)

1. The user logs in. The server creates a **session** record and sends back a random **session ID** in a cookie.
2. The browser sends the cookie with every request, and the server looks up the session.

Simple and secure for traditional websites, but the server must store sessions, and cookies are tied to browsers.

### Tokens (JWT)

1. The user logs in. The server, or an **identity provider**, issues a signed **token**.
2. The client sends it with every request in a header:

```text
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. The API checks the token's **signature**. It doesn't need to look anything up.

Tokens work well for APIs used by phone apps, single-page apps and other services. That's what you'll use in this program.

## Inside a JSON Web Token (JWT)

A JWT has three Base64URL-encoded parts separated by dots: `header.payload.signature`.

```json
// Header: how it was signed
{ "alg": "RS256", "typ": "JWT" }

// Payload: the "claims"
{
  "iss": "https://your-tenant.example.com/",   // issuer: who created it
  "sub": "user-42",                             // subject: the user
  "aud": "coffee-api",                          // audience: which API it's for
  "iat": 1794830000,                            // issued at
  "exp": 1794833600,                            // expires at
  "permissions": ["get:drinks-detail"]
}
```

The **signature** is made from the header and payload using a secret or private key. If anyone changes even one character of the payload, the signature no longer matches.

Try it with PyJWT (`pip install pyjwt`):

```python
import jwt, datetime

secret = "use-a-long-random-secret-from-an-env-variable"
token = jwt.encode(
    {"sub": "user-42", "name": "Sara",
     "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=15)},
    secret, algorithm="HS256",
)
print(jwt.decode(token, secret, algorithms=["HS256"]))
# {'sub': 'user-42', 'name': 'Sara', 'exp': ...}
```

Now decode the middle part with plain Base64 (`base64.urlsafe_b64decode(payload + "==")`). You can read it! **A JWT is signed, not encrypted.** Never put secrets in a token's payload. And if you edit the payload and try `jwt.decode` again, you get `InvalidSignatureError`: tampering is detected.

### HS256 vs RS256

- **HS256** uses one shared secret to both sign and verify. Anyone who can verify can also create tokens.
- **RS256** uses a key pair: the identity provider signs with its **private** key, and your API verifies with the **public** key. Your API can't create tokens, which is exactly what you want.

## Identity providers

Building login, password resets, MFA and account recovery yourself is hard to get right. Most teams use an **identity provider** such as Auth0, Okta, Microsoft Entra ID, Google Identity or Amazon Cognito. They follow the standard protocols **OAuth 2.0** and **OpenID Connect**.

The flow you'll implement:

```text
1. User clicks "Log in" in the app ──▶ identity provider's login page
2. User signs in (and does MFA)     ──▶ provider returns an access token (a JWT) to the app
3. App calls your API with           Authorization: Bearer <token>
4. Your API verifies the signature with the provider's public keys,
   then checks exp, aud and iss, and finally permissions
```

Providers publish their public keys at a **JWKS** (JSON Web Key Set) URL, usually `https://<your-domain>/.well-known/jwks.json`.

## Verifying tokens in Flask

Create `auth.py`:

```python
from functools import wraps
import jwt
from flask import request, g

AUTH_DOMAIN = "your-tenant.example.com"      # your identity provider
API_AUDIENCE = "coffee-api"                   # the API identifier you registered
ALGORITHMS = ["RS256"]
jwks_client = jwt.PyJWKClient(f"https://{AUTH_DOMAIN}/.well-known/jwks.json")


class AuthError(Exception):
    def __init__(self, message, status_code):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def get_token_from_header():
    header = request.headers.get("Authorization", "")
    parts = header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise AuthError("Authorization header must be: Bearer <token>", 401)
    return parts[1]


def verify_token(token):
    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=ALGORITHMS,
            audience=API_AUDIENCE,
            issuer=f"https://{AUTH_DOMAIN}/",
        )
    except jwt.ExpiredSignatureError:
        raise AuthError("Token expired", 401)
    except jwt.PyJWTError:
        raise AuthError("Invalid token", 401)
```

`jwt.decode` checks the signature **and** the expiry, audience and issuer. Notice `algorithms=ALGORITHMS`: always state which algorithms you accept, so an attacker can't trick your API into using a weaker one.

Return a clean JSON error when authentication fails, in your app factory:

```python
from auth import AuthError

@app.errorhandler(AuthError)
def handle_auth_error(error):
    return jsonify(success=False, error=error.status_code, message=error.message), error.status_code
```

In the next lessons you'll wrap these functions in a decorator that protects endpoints and checks permissions.

:::quiz
Q: Can someone read the payload of a JWT without the secret key?
- [x] Yes: it's only Base64URL-encoded, so never put secrets in it
- [ ] No: the payload is encrypted
- [ ] Only if the token has expired
Why: JWTs are signed, not encrypted. The signature stops tampering, not reading.

Q: What happens if an attacker changes the `sub` claim in a token?
- [ ] The API accepts it as a different user
- [x] Signature verification fails and the API rejects it
- [ ] The token's expiry is reset
Why: The signature covers the payload, so any change invalidates it.

Q: Why is RS256 a good fit when an identity provider issues tokens?
- [ ] It's shorter than HS256
- [x] Your API verifies with a public key, so it can check tokens but can't create them
- [ ] It doesn't need any keys
Why: Only the provider holds the private signing key. Your API only needs the public key to verify.
:::
