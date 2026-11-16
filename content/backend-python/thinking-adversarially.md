Developers usually think about how an app *should* be used. Attackers think about how it *could* be misused. To build secure software, you need to switch between both views. This lesson teaches you to think like an attacker, and to build security into how you work.

> Only ever test the security of systems you own or have written permission to test. Attacking other people's systems is illegal, even "just to see".

## Threat modeling

Before building a feature, ask four questions:

1. **What are we building?** Sketch the data flow: who sends what, where it's stored.
2. **What can go wrong?**
3. **What will we do about it?**
4. **Did we do a good job?**

The **STRIDE** checklist helps with question 2:

| Threat | Question to ask | Protection |
| --- | --- | --- |
| **S**poofing | Could someone pretend to be another user? | Authentication |
| **T**ampering | Could data be changed in transit or storage? | Signatures, HTTPS, validation |
| **R**epudiation | Could someone deny doing something? | Logging |
| **I**nformation disclosure | Could data leak to the wrong people? | Authorization, encryption |
| **D**enial of service | Could the service be overwhelmed? | Rate limits, pagination |
| **E**levation of privilege | Could a user gain powers they shouldn't have? | Permission checks |

Try it on your coffee shop project: for each endpoint, walk through the six letters.

## The OWASP Top 10

**OWASP** (the Open Worldwide Application Security Project) is a nonprofit that publishes free security guidance. Its **Top 10** lists the most critical web application security risks. The current edition is **OWASP Top 10:2025**:

| # | Risk | Example in a Flask API |
| --- | --- | --- |
| A01 | Broken Access Control | Forgetting `@requires_auth`, or not checking who owns a record |
| A02 | Security Misconfiguration | Running with `--debug` in production, or a CORS policy of `*` on an API with logins |
| A03 | Software Supply Chain Failures | Installing a malicious or outdated package |
| A04 | Cryptographic Failures | Storing passwords with a fast hash, or skipping HTTPS |
| A05 | Injection | Building SQL with f-strings from user input |
| A06 | Insecure Design | No rate limit on login, so passwords can be guessed endlessly |
| A07 | Authentication Failures | Not checking a token's expiry, audience or algorithm |
| A08 | Software or Data Integrity Failures | Trusting data or updates that aren't verified |
| A09 | Security Logging & Alerting Failures | No record of failed logins or permission errors |
| A10 | Mishandling of Exceptional Conditions | Errors that leak stack traces, or that "fail open" and grant access |

You've already defended against several of these in this program: parameterized queries (A05), password hashing (A04), token verification (A07) and permission checks (A01).

## Common Flask mistakes to avoid

- **Debug mode in production.** The interactive debugger can let anyone run code on your server. Use a production server such as Gunicorn, and never `--debug`.
- **Leaking errors.** Return a generic message to clients; log the details on the server.
- **Trusting input.** Validate types, lengths and allowed values for everything from the client: body, query string, headers and URL.
- **Secrets in Git.** Use environment variables. If a secret is ever committed, **rotate it immediately**: deleting the file doesn't remove it from Git history.

## A secure development process

Security isn't a feature you add at the end. Build it into every step:

1. **Design:** threat-model new features.
2. **Code:** use safe defaults (the ORM, parameterized queries, `requires_auth` on every non-public endpoint).
3. **Review:** have someone else review every change, with security in mind.
4. **Test:** write tests for the security rules, such as 401 and 403 responses, not only for the happy path.
5. **Dependencies:** pin versions in `requirements.txt` and scan them for known vulnerabilities. Run `pip install pip-audit` then `pip-audit`, and turn on GitHub's Dependabot alerts.
6. **Monitor:** log authentication failures and errors, and review them.

## Staying informed

New vulnerabilities are found every day. Follow:

- The [OWASP website](https://owasp.org), including its Cheat Sheet Series of practical guides
- Security advisories for the packages you use, such as the GitHub Advisory Database
- The **CVE** system, which gives each publicly known vulnerability an ID like `CVE-2026-12345`

If you ever find a vulnerability in someone else's software, report it privately to the maintainers (**responsible disclosure**) rather than publishing it.

:::quiz
Q: In STRIDE, what does "Elevation of privilege" mean?
- [ ] Making the server run faster
- [x] A user gaining permissions they shouldn't have
- [ ] Promoting an employee
Why: Elevation of privilege is when someone gets more access than intended, such as a customer performing manager actions.

Q: Which is an example of OWASP A05, Injection?
- [x] Building a SQL query by inserting user input with an f-string
- [ ] Forgetting to rotate a password
- [ ] Using HTTPS
Why: Injection happens when untrusted input is treated as part of a command or query.

Q: You accidentally committed an API key and then deleted the file in the next commit. Is it safe?
- [ ] Yes, the file is gone
- [x] No, it's still in Git history, so rotate (replace) the key immediately
- [ ] Only if the repository is private
Why: Git keeps every past version. Treat any committed secret as exposed.
:::
