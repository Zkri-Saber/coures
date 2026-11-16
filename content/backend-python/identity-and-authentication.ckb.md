هەموو داواکارییەک بۆ API ـەکەت وەک نامۆیەک دەگات. **ناسینەوە** (authentication) ئەو ڕێگایەیە کە باکئێندەکەت پێی دەزانێت کێ ناردوویەتی. لەم وانەیەدا ڕێگا سەرەکییەکان فێر دەبیت، پاشان پشکنینی تۆکن لە Flask دا جێبەجێ دەکەیت.

## هۆکارەکانی ناسینەوە

خەڵک بە یەک یان زیاتر لە **هۆکار** (factor) دەیسەلمێنن کێن:

| هۆکار | نموونەکان |
| --- | --- |
| شتێک کە **دەیزانیت** | وشەی نهێنی یان PIN |
| شتێک کە **هەتە** | مۆبایلەکەت (بەرنامەیەکی ناسینەوە)، کلیلێکی ئاسایش |
| شتێک کە **خۆتیت** | پەنجەمۆر یان ڕوخسار |

**ناسینەوەی فرە-هۆکار** (MFA) دوو یان زیاتر لە هۆکاری جیاواز تێکەڵ دەکات. زۆربەی هەرە زۆری دەستبەسەرداگرتنی هەژمارەکان ڕادەگرێت، چونکە وشەیەکی نهێنیی دزراو بە تەنها بەس نییە.

## لەبیرهێشتنەوەی بەکارهێنەرێکی چووەژوورەوە

HTTP بێ-دۆخە، بۆیە دوای چوونەژوورەوە، هەموو داواکارییەک دەبێت بیسەلمێنێت کێ ناردوویەتی. دوو ڕێگای باو هەیە.

### دانیشتنەکان (کووکی)

1. بەکارهێنەر دەچێتە ژوورەوە. ڕاژەکار تۆمارێکی **دانیشتن** (session) دروست دەکات و **ناسنامەی دانیشتنێکی** هەڕەمەکی لەناو کووکییەکدا دەنێرێتەوە.
2. وێبگەڕ کووکییەکە لەگەڵ هەموو داواکارییەکدا دەنێرێت، و ڕاژەکار بە دوای دانیشتنەکەدا دەگەڕێت.

سادە و سەلامەتە بۆ ماڵپەڕە ئاساییەکان، بەڵام ڕاژەکار دەبێت دانیشتنەکان هەڵبگرێت، و کووکییەکان بە وێبگەڕەکانەوە بەستراون.

### تۆکنەکان (JWT)

1. بەکارهێنەر دەچێتە ژوورەوە. ڕاژەکار، یان **دابینکەرێکی ناسنامە**، **تۆکنێکی** واژووکراو دەردەکات.
2. ڕاژەخواز لەگەڵ هەموو داواکارییەکدا لە سەرپەڕەیەکدا دەینێرێت:

```text
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

3. API ـەکە **واژووی** تۆکنەکە دەپشکنێت. پێویستی بە گەڕان بە دوای هیچ شتێکدا نییە.

تۆکنەکان باش کار دەکەن بۆ ئەو API ـانەی بەرنامەی مۆبایل، بەرنامەی تاک-پەڕە و خزمەتگوزارییەکانی تر بەکاریان دەهێنن. ئەوە ئەوەیە کە لەم بەرنامەیەدا بەکاری دەهێنیت.

## ناوەوەی JSON Web Token (JWT)

JWT سێ بەشی کۆدکراو بە Base64URL ـی هەیە کە بە خاڵ جیا کراونەتەوە: `header.payload.signature`.

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

**واژووەکە** (signature) لە سەرپەڕە و بارەکە (payload) دروست دەکرێت بە بەکارهێنانی نهێنییەک یان کلیلێکی تایبەت. ئەگەر کەسێک تەنانەت یەک پیتی بارەکە بگۆڕێت، واژووەکە ئیتر ڕێک نایەتەوە.

بە PyJWT تاقی بکەرەوە (`pip install pyjwt`):

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

ئێستا بەشی ناوەڕاست بە Base64 ـی ئاسایی بکەرەوە (`base64.urlsafe_b64decode(payload + "==")`). دەتوانیت بیخوێنیتەوە! **JWT واژووکراوە، نەک شێوەگۆڕدراو.** هەرگیز نهێنی مەخەرە ناو باری تۆکنێکەوە. و ئەگەر بارەکە دەستکاری بکەیت و دووبارە `jwt.decode` تاقی بکەیتەوە، `InvalidSignatureError` وەردەگریت: دەستکاری دەدۆزرێتەوە.

### HS256 بەرامبەر RS256

- **HS256** یەک نهێنیی هاوبەش بەکاردەهێنێت بۆ واژووکردن و پشتڕاستکردنەوە. هەر کەسێک بتوانێت پشتڕاستی بکاتەوە، دەتوانێت تۆکنیش دروست بکات.
- **RS256** جووتێک کلیل بەکاردەهێنێت: دابینکەری ناسنامە بە کلیلی **تایبەتی** خۆی واژوو دەکات، و API ـەکەت بە کلیلی **گشتی** پشتڕاستی دەکاتەوە. API ـەکەت ناتوانێت تۆکن دروست بکات، کە ڕێک ئەوەیە کە دەتەوێت.

## دابینکەرانی ناسنامە

دروستکردنی چوونەژوورەوە، ڕێکخستنەوەی وشەی نهێنی، MFA و گەڕاندنەوەی هەژمار بە خۆت قورسە بە دروستی بیکەیت. زۆربەی تیمەکان **دابینکەرێکی ناسنامە** (identity provider) بەکاردەهێنن وەک Auth0، Okta، Microsoft Entra ID، Google Identity یان Amazon Cognito. ئەوان پەیڕەوی پرۆتۆکۆڵە ستانداردەکانی **OAuth 2.0** و **OpenID Connect** دەکەن.

ئەو ڕەوتەی جێبەجێی دەکەیت:

1. بەکارهێنەر لە بەرنامەکەدا کلیک لە "چوونەژوورەوە" دەکات و دەچێتە پەڕەی چوونەژوورەوەی دابینکەری ناسنامە.
2. بەکارهێنەر دەچێتە ژوورەوە (و MFA دەکات)، و دابینکەرەکە تۆکنێکی دەستگەیشتن (JWT) دەگەڕێنێتەوە بۆ بەرنامەکە.
3. بەرنامەکە API ـەکەت بانگ دەکات لەگەڵ `Authorization: Bearer <token>`.
4. API ـەکەت واژووەکە بە کلیلە گشتییەکانی دابینکەرەکە پشتڕاست دەکاتەوە، پاشان `exp`، `aud` و `iss`، و لە کۆتاییدا مۆڵەتەکان دەپشکنێت.

هەمان ڕەوت وەک وێنەیەک:

```text
1. User clicks "Log in" in the app ──▶ identity provider's login page
2. User signs in (and does MFA)     ──▶ provider returns an access token (a JWT) to the app
3. App calls your API with           Authorization: Bearer <token>
4. Your API verifies the signature with the provider's public keys,
   then checks exp, aud and iss, and finally permissions
```

دابینکەرەکان کلیلە گشتییەکانیان لە URL ـێکی **JWKS** (JSON Web Key Set) دا بڵاو دەکەنەوە، زۆرجار `https://<your-domain>/.well-known/jwks.json`.

## پشتڕاستکردنەوەی تۆکنەکان لە Flask دا

`auth.py` دروست بکە:

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

`jwt.decode` واژووەکە **و** بەسەرچوون، بینەر (audience) و دەرکەرەکە (issuer) دەپشکنێت. سەرنجی `algorithms=ALGORITHMS` بدە: هەمیشە بڵێ کام ئەلگۆریتمانە قبووڵ دەکەیت، بۆ ئەوەی هێرشبەرێک نەتوانێت API ـەکەت فریو بدات بۆ بەکارهێنانی یەکێکی لاوازتر.

کاتێک ناسینەوە شکست دەهێنێت، هەڵەیەکی JSON ـی پاک بگەڕێنەوە، لە کارگەی بەرنامەکەتدا:

```python
from auth import AuthError

@app.errorhandler(AuthError)
def handle_auth_error(error):
    return jsonify(success=False, error=error.status_code, message=error.message), error.status_code
```

لە وانەکانی داهاتوودا ئەم فەنکشنانە لەناو decorator ـێکدا دەپێچیتەوە کە خاڵەکانی کۆتایی دەپارێزێت و مۆڵەتەکان دەپشکنێت.

:::quiz
Q: ئایا کەسێک دەتوانێت باری JWT ـێک بەبێ کلیلی نهێنی بخوێنێتەوە؟
- [x] بەڵێ: تەنها بە Base64URL کۆدکراوە، بۆیە هەرگیز نهێنی تێدا دامەنێ
- [ ] نەخێر: بارەکە شێوەگۆڕدراوە
- [ ] تەنها ئەگەر تۆکنەکە بەسەرچووبێت
Why: JWT ـەکان واژووکراون، نەک شێوەگۆڕدراو. واژووەکە ڕێگری لە دەستکاری دەکات، نەک لە خوێندنەوە.

Q: چی ڕوودەدات ئەگەر هێرشبەرێک داوای (claim) `sub` لە تۆکنێکدا بگۆڕێت؟
- [ ] API وەک بەکارهێنەرێکی جیاواز قبووڵی دەکات
- [x] پشتڕاستکردنەوەی واژوو شکست دەهێنێت و API ڕەتی دەکاتەوە
- [ ] کاتی بەسەرچوونی تۆکنەکە ڕێک دەخرێتەوە
Why: واژووەکە بارەکە دادەپۆشێت، بۆیە هەر گۆڕانکارییەک بەتاڵی دەکاتەوە.

Q: بۆچی RS256 گونجاوە کاتێک دابینکەرێکی ناسنامە تۆکن دەردەکات؟
- [ ] لە HS256 کورتترە
- [x] API ـەکەت بە کلیلێکی گشتی پشتڕاست دەکاتەوە، بۆیە دەتوانێت تۆکن بپشکنێت بەڵام ناتوانێت دروستیان بکات
- [ ] پێویستی بە هیچ کلیلێک نییە
Why: تەنها دابینکەرەکە کلیلی تایبەتی واژووکردنی هەیە. API ـەکەت تەنها پێویستی بە کلیلی گشتییە بۆ پشتڕاستکردنەوە.
:::
