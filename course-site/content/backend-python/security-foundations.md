In this part you'll add accounts, logins and permissions to your applications. Before writing any code, you need a shared vocabulary for **security**, and a clear picture of the tools involved.

## The CIA triad

Information security protects three properties:

| Property | Means | Example of a failure |
| --- | --- | --- |
| **Confidentiality** | Only the right people can see the data | A leaked customer list |
| **Integrity** | Data can't be changed without permission | Someone changes their grade in a database |
| **Availability** | The system works when people need it | A website knocked offline by a flood of traffic |

Every security decision protects at least one of these.

## Key terms

- **Asset:** something worth protecting, such as user data, money or your reputation.
- **Vulnerability:** a weakness, such as a missing permission check.
- **Threat:** someone or something that could exploit a weakness.
- **Risk:** how likely that is, multiplied by how bad it would be.

## Authentication vs authorization

These two words are easy to mix up, and both appear in every lesson of this part:

- **Authentication (AuthN):** *Who are you?* Proving identity, for example by logging in.
- **Authorization (AuthZ):** *What are you allowed to do?* Checking permissions.

At an airport, your passport **authenticates** you. Your boarding pass **authorizes** you to board one particular flight.

## Principles you'll apply

- **Least privilege:** give each user, program and database account only the access it needs, nothing more.
- **Defense in depth:** use several layers of protection, so one mistake isn't fatal.
- **Fail securely:** when something goes wrong, deny access rather than allow it.
- **Never trust the client:** anything from the browser or app can be faked. The backend must check everything itself.

## Encoding, encryption and hashing

These three are often confused, and confusing them causes real breaches.

| | What it does | Reversible? | Use it for |
| --- | --- | --- | --- |
| **Encoding** (e.g. Base64) | Changes the format of data so it can be transmitted | Yes, by **anyone** | Transport, not secrecy |
| **Encryption** (e.g. AES, TLS) | Scrambles data with a key | Yes, with the **key** | Keeping data secret |
| **Hashing** (e.g. SHA-256, scrypt) | Turns data into a fixed-size fingerprint | **No** | Checking passwords and file integrity |

```python
>>> import base64
>>> base64.b64encode(b"hello").decode()
'aGVsbG8='
>>> base64.b64decode("aGVsbG8=").decode()
'hello'
```

Base64 **is not security**: anyone can decode it. You'll see this matters when we look at tokens.

## Two kinds of encryption

- **Symmetric:** the same secret key encrypts and decrypts. Fast, but both sides must share the secret safely.
- **Asymmetric:** a **key pair**. The **public key** can be shared with anyone; the **private key** stays secret. What one key locks, only the other can unlock. This also enables **digital signatures**: sign with the private key, and anyone can verify with the public key.

**HTTPS** uses both: asymmetric cryptography to set up a connection safely, then fast symmetric encryption for the data. Always serve real applications over HTTPS.

## Keep secrets out of your code

Passwords, API keys and database URLs with passwords must **never** be committed to Git, even in a private repository. Read them from **environment variables**:

```python
import os

DATABASE_URL = os.environ["DATABASE_URL"]
```

For local development, keep them in a `.env` file that's listed in `.gitignore`, and load it with the `python-dotenv` package. Share a `.env.example` file with the variable *names* but no real values.

:::quiz
Q: A user logs in successfully but tries to delete another user's account. Which check should stop them?
- [ ] Authentication
- [x] Authorization
- [ ] Encoding
Why: They've proven who they are (authentication). Whether they may delete that account is an authorization question.

Q: Which statement about Base64 is true?
- [ ] It's a strong form of encryption
- [x] Anyone can decode it; it only changes the format of data
- [ ] It can't be reversed
Why: Base64 is an encoding. It provides no secrecy at all.

Q: Where should your database password live?
- [ ] In `app.py`, so it's easy to find
- [ ] In the README
- [x] In an environment variable, kept out of Git
Why: Anything committed to Git can leak. Environment variables keep secrets separate from code.
:::
