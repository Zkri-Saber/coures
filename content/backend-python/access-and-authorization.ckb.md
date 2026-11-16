زانینی ئەوەی **کێ** داواکارییەکی ناردووە تەنها نیوەی کارەکەیە. ئێستا API ـەکەت دەبێت بڕیار بدات **ڕێگەیان پێ دراوە چی بکەن**. کۆنترۆڵی دەستگەیشتنی تێکشکاو مەترسیی ژمارە یەکە لە لیستی OWASP Top 10 ـی مەترسییەکانی ئاسایشی بەرنامەی وێب، بۆیە ئەم وانەیە گرنگە.

## مۆڵەتەکان و ڕۆڵەکان

**مۆڵەت** (permission) یەک کرداری دیاریکراوە لەسەر یەک جۆر سەرچاوە. شێوازێکی باوی ناونان `action:resource` ـە:

```text
get:drinks-detail     post:drinks     patch:drinks     delete:drinks
```

پێدانی دەیان مۆڵەت بە هەر بەکارهێنەرێک بە جیا بەڕێوەنابرێت. **کۆنترۆڵی دەستگەیشتن لەسەر بنەمای ڕۆڵ** (RBAC) مۆڵەتەکان لە **ڕۆڵەکان** دا کۆ دەکاتەوە، و ڕۆڵ دەدات بە بەکارهێنەران:

| ڕۆڵ | مۆڵەتەکان |
| --- | --- |
| کڕیار | هیچ (دەتوانێت لیستی خواردنەوە گشتییەکە ببینێت) |
| قاوەساز (Barista) | `get:drinks-detail` |
| بەڕێوەبەر | `get:drinks-detail`، `post:drinks`، `patch:drinks`، `delete:drinks` |

کاتێک کەسێک دێتە ناو کارەکە یان کارەکەی دەگۆڕێت، ڕۆڵەکەی دەگۆڕیت، نەک لیستێکی درێژی مۆڵەتەکان.

## خستنە ناوی مۆڵەتەکان بۆ ناو تۆکنەکە

لەگەڵ دابینکەرێکی ناسنامە، مۆڵەت و ڕۆڵەکانی API ـەکەت لە داشبۆردەکەیدا پێناسە دەکەیت، ڕۆڵ دەدەیت بە بەکارهێنەران، و ئەو ڕێکخستنە چالاک دەکەیت کە مۆڵەتەکان زیاد دەکات بۆ تۆکنەکانی دەستگەیشتن. پاشان تۆکنەکان داوایەکی (claim) وەک ئەمەیان تێدا دەبێت:

```json
"permissions": ["get:drinks-detail", "post:drinks"]
```

API ـەکەت دوای پشتڕاستکردنەوەی تۆکنەکە ئەو داوایە دەخوێنێتەوە. لەبەر ئەوەی تۆکنەکە واژووکراوە، بەکارهێنەران ناتوانن خۆیان مۆڵەتی بۆ زیاد بکەن.

## decorator ـی `requires_auth`

ئەمانە زیاد بکە بۆ `auth.py`، لە خوار فەنکشنەکانی وانەی ناسینەوەوە:

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

پاراستنی خاڵێکی کۆتایی ئێستا یەک دێڕە:

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

ڕیزبەندیی decorator ـەکان گرنگە: decorator ـی ڕێڕەو **یەکەم** دێت (لە سەرەوە)، پاشان `requires_auth`.

### 401 یان 403؟

| دۆخ | کۆدی دۆخ |
| --- | --- |
| هیچ تۆکنێک نییە، سەرپەڕەی شێواو، واژووی نادروست، تۆکنی بەسەرچوو | **401 Unauthorized** (نازانین تۆ کێیت) |
| تۆکنی دروست، بەڵام مۆڵەتەکە ونە | **403 Forbidden** (دەزانین تۆ کێیت، و وەڵامەکە نەخێرە) |

## بەبێ دابینکەرێکی ناسنامەی ڕاستەقینە تاقی بکەرەوە

دەتوانیت لۆجیکی ڕێگەپێدان تاقی بکەیتەوە بە واژووکردنی تۆکنی تاقیکردنەوەی خۆت و ئاراستەکردنی `verify_token` بۆ کلیلی تاقیکردنەوەکەت. بە `unittest.mock`، دەتوانیت لە تاقیکردنەوەکاندا گەڕانی JWKS جێگە بگریتەوە:

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

(`cryptography` لە `pip install cryptography` ـەوە دێت.)

## ئەو یاسایانەی ڕێگری لە دزەکردنی ڕاستەقینە دەکەن

- **هەمیشە باکئێند بڕیار دەدات.** شاردنەوەی دوگمەی "سڕینەوە" لە فرۆنتئێنددا دیزاینێکی باشە، بەڵام ئاسایش نییە. هەر کەسێک دەتوانێت داواکارییەکی `DELETE` بە curl بنێرێت.
- **دەستگەیشتن بە شتە دیاریکراوەکە بپشکنە**، نەک تەنها کردارەکە. ئەگەر بەکارهێنەران دەتوانن داواکارییەکانی *خۆیان* دەستکاری بکەن، بپشکنە کە `user_id` ـی داواکارییەکە لەگەڵ `g.user["sub"]` یەک دەگرێتەوە. ئەگەرنا گۆڕینی `/orders/41` بۆ `/orders/42` داتای کەسێکی تر ئاشکرا دەکات. ئەم کەموکوڕییە پێی دەوترێت **IDOR** (insecure direct object reference).
- **بە شێوەی بنەڕەتی ڕەت بکەرەوە.** خاڵە کۆتاییە نوێیەکان دەبێت ناسینەوە داوا بکەن مەگەر بە ئەنقەست گشتییان بکەیت.
- **کەمترین دەسەڵات.** بە هەر ڕۆڵێک تەنها ئەوە بدە کە پێویستییەتی.

:::quiz
Q: تۆکنێکی دروستی قاوەسازێک هەوڵی سڕینەوەی خواردنەوەیەک دەدات، کە پێویستی بە `delete:drinks` ـە. API دەبێت چی بگەڕێنێتەوە؟
- [ ] 401
- [x] 403
- [ ] 404
Why: بەکارهێنەرەکە ناسراوەتەوە (تۆکنی دروست) بەڵام ڕێگەی پێ نەدراوە بۆ ئەم کردارە.

Q: فرۆنتئێند دوگمەی سڕینەوە لە قاوەسازەکان دەشارێتەوە. ئایا API بەبێ پشکنینی مۆڵەت سەلامەتە؟
- [ ] بەڵێ، ناتوانن دوگمەکە ببینن
- [x] نەخێر، هەر کەسێک دەتوانێت داواکارییەکە ڕاستەوخۆ بنێرێت، بۆیە باکئێند دەبێت بپشکنێت
- [ ] بەڵێ، تا ئەو کاتەی CORS ڕێکخراوە
Why: دەکرێت ڕاژەخوازەکان تێپەڕێنرێن یان ساختە بکرێن. ڕێگەپێدان دەبێت لەسەر ڕاژەکار جێبەجێ بکرێت.

Q: سوودی سەرەکیی کۆنترۆڵی دەستگەیشتن لەسەر بنەمای ڕۆڵ چییە؟
- [ ] پێویستی بە ناسینەوە نامێنێت
- [x] مۆڵەتەکان لە ڕۆڵەکاندا کۆ دەکرێنەوە، بۆیە بەڕێوەبردن و پێداچوونەوەی دەستگەیشتن ئاسانترە
- [ ] تۆکنەکان بچووکتر دەکات
Why: پێدانی ڕۆڵ لە جیاتی مۆڵەتی تاک دەستگەیشتن یەکگرتوو دەهێڵێتەوە کاتێک خەڵک دێن، دەڕۆن یان کار دەگۆڕن.
:::
