Passwords are the most common way to log in, and one of the most common ways systems get breached. Even if you use an identity provider in production, you need to know how to handle passwords correctly, both for your own projects and to spot dangerous code in other people's.

## Never store passwords as they are

If your database is ever leaked (and many are), every password stored as plain text is exposed instantly. Because people reuse passwords, that also exposes their email, bank and social accounts.

**Encrypting** passwords isn't the answer either: whoever steals the key can decrypt them all. Instead, store a **hash**.

## Hashing, salting and slowing down

A **hash function** turns a password into a fingerprint that can't be reversed. To log someone in, you hash what they typed and compare it with the stored hash.

But plain fast hashes like SHA-256 aren't enough:

- **Identical passwords give identical hashes**, so one cracked hash reveals everyone who used `password123`. The fix is a **salt**: random data added to each password before hashing, stored alongside the hash. Now identical passwords have different hashes.
- **Fast hashes can be guessed fast.** Attackers try billions of guesses per second on graphics cards. Password hashing algorithms are deliberately **slow** and use lots of memory, to make each guess expensive.

Use a purpose-built password hashing algorithm: **Argon2id**, **scrypt** or **bcrypt**.

## Hashing passwords in Flask

Flask's companion library, Werkzeug, includes safe helpers. Its current default algorithm is scrypt, with a random salt for each password:

```python
from werkzeug.security import generate_password_hash, check_password_hash

stored = generate_password_hash("correct horse battery staple")
print(stored)
# scrypt:32768:8:1$PnKKgPIc0K8F8...$a7f3...   (algorithm, settings, salt, hash)

check_password_hash(stored, "correct horse battery staple")   # True
check_password_hash(stored, "Correct horse battery staple")   # False
```

A user model with sign-up and login might look like this:

```python
class User(db.Model):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
```

```python
@app.post("/api/login")
def login():
    body = request.get_json(silent=True) or {}
    user = db.session.execute(
        db.select(User).filter_by(email=body.get("email", "").lower())
    ).scalar_one_or_none()
    if user is None or not user.check_password(body.get("password", "")):
        abort(401)          # same response either way
    ...                     # create a session or token
```

Notice that a wrong email and a wrong password get **the same response**. Different messages ("no such user" vs "wrong password") would let attackers discover which emails have accounts.

## What makes a good password policy?

Modern guidance from the US National Institute of Standards and Technology (NIST SP 800-63B-4, 2025) is clear, and differs from rules you may have seen:

- **Length matters most.** Require at least **15 characters** when a password is the only factor, or at least 8 when it's combined with MFA.
- **Allow long passwords**, at least 64 characters, including spaces and any characters. This supports passphrases.
- **Don't force composition rules** like "one uppercase, one number, one symbol". They make passwords harder to remember, not stronger.
- **Don't force regular password changes.** Require a change only when there's evidence of compromise.
- **Check new passwords against a blocklist** of common and previously breached passwords.
- **No security questions or password hints.**

## Other protections around passwords

- **Rate-limit login attempts** per account and per IP address, so attackers can't try millions of guesses. The Flask-Limiter extension can help.
- **Offer MFA**, and encourage password managers.
- **Never log passwords**, not even failed attempts. Check your error logs and debug prints.
- **Use HTTPS everywhere**, so passwords are never sent unencrypted.
- **Reset tokens** must be random, single-use and short-lived. Generate them with `secrets.token_urlsafe(32)`, never with `random`.

:::quiz
Q: Why add a salt before hashing a password?
- [ ] To make the password shorter
- [x] So identical passwords produce different hashes, defeating precomputed and bulk attacks
- [ ] So the hash can be reversed later
Why: A unique random salt per password means attackers must crack each hash separately.

Q: Which algorithm is appropriate for storing passwords?
- [ ] MD5
- [ ] SHA-256 on its own
- [x] scrypt, Argon2id or bcrypt
Why: Password hashing algorithms are deliberately slow and memory-hard. Fast general-purpose hashes are easy to brute-force.

Q: According to current NIST guidance, which rule should you drop?
- [ ] Checking passwords against breached-password lists
- [x] Forcing users to change their password every 90 days
- [ ] Allowing passwords of at least 64 characters
Why: Forced periodic changes lead to weaker, predictable passwords. Change passwords when there's evidence of compromise.
:::
