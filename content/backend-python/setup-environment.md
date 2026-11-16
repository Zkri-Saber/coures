Before writing any code, let's set up the tools you'll use for the rest of the program. Take your time: a clean setup saves hours of confusing errors later.

## 1. Check Python

Open a terminal and run:

```bash
python3 --version
```

On Windows, try `py --version` instead. You need **3.10 or newer**. If you don't have it, install it from [python.org](https://www.python.org/downloads/). On Windows, tick **Add python.exe to PATH** in the installer.

## 2. Create a project and a virtual environment

A **virtual environment** keeps each project's packages separate, so one project's versions don't break another's.

```bash
mkdir todoapp
cd todoapp
python3 -m venv .venv
```

Activate it. You'll do this every time you open a new terminal for this project:

```bash
# macOS and Linux
source .venv/bin/activate

# Windows (PowerShell)
.venv\Scripts\Activate.ps1
```

Your prompt now starts with `(.venv)`. Install the packages for this course:

```bash
pip install flask flask-sqlalchemy flask-migrate "psycopg[binary]"
pip freeze > requirements.txt
```

`psycopg` is the **driver** that lets Python talk to PostgreSQL. `requirements.txt` records the exact versions, so anyone can recreate your environment with `pip install -r requirements.txt`.

## 3. Run PostgreSQL

Choose **one** of these options.

### Option A: Docker (recommended)

[Docker](https://www.docker.com/products/docker-desktop/) runs software in isolated **containers**. One command gives you a PostgreSQL server:

```bash
docker run --name pg -e POSTGRES_PASSWORD=postgres -p 5432:5432 \
  -v pgdata:/var/lib/postgresql/data -d postgres:17
```

- `-e POSTGRES_PASSWORD=postgres` sets the password for the `postgres` user.
- `-p 5432:5432` makes the database reachable on your computer at port 5432.
- `-v pgdata:...` stores the data in a named volume, so it survives restarts.

Later, use `docker stop pg` and `docker start pg` to stop and start it.

### Option B: Install PostgreSQL directly

Download it from [postgresql.org/download](https://www.postgresql.org/download/) and follow the installer. Remember the password you choose for the `postgres` user.

## 4. Create a database

Open the PostgreSQL command-line client, `psql`:

```bash
# With Docker
docker exec -it pg psql -U postgres

# With a direct install
psql -U postgres
```

Then create a database for the to-do app and quit:

```sql
CREATE DATABASE todoapp;
\q
```

## 5. Prepare Git

Create a `.gitignore` file so you don't commit your virtual environment or secrets:

```text
.venv/
__pycache__/
.env
*.db
```

Then run `git init` and make your first commit.

## 6. Choose an editor

Any code editor works. [VS Code](https://code.visualstudio.com) with the **Python** extension is a popular free choice. Point it at your `.venv` interpreter so it understands your installed packages.

> If something doesn't work, re-read each step carefully, then use the "Getting Help" approach: read the error, search for it, then ask.

:::quiz
Q: Why use a virtual environment?
- [ ] It makes Python run faster
- [x] It keeps each project's packages and versions separate
- [ ] It's required to use PostgreSQL
Why: Different projects may need different package versions. A virtual environment isolates them.

Q: What does `pip freeze > requirements.txt` do?
- [x] Saves the exact installed package versions to a file
- [ ] Stops pip from installing anything else
- [ ] Deletes unused packages
Why: The file lets you or anyone else reinstall exactly the same versions with `pip install -r requirements.txt`.
:::
