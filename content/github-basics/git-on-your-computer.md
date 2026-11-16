Editing on github.com is great for small changes. For real projects, you'll write code on your own computer with an editor like VS Code, then use **Git** to save commits and send them to GitHub.

## Two ways to start

- **GitHub Desktop** ([desktop.github.com](https://desktop.github.com)) is an app with buttons for everything in this lesson. It's a friendly way to begin.
- **Git on the command line** is what most programmers use, and it works the same on every computer. This lesson shows the commands, so you understand what any app is doing for you.

## Install and set up Git

- **Windows:** download Git for Windows from [git-scm.com](https://git-scm.com) and accept the default options.
- **Mac:** open Terminal and type `git --version`. If Git isn't installed, your Mac offers to install it.
- **Linux:** install the `git` package with your package manager.

Then tell Git who you are. These details are attached to every commit you make:

```bash
git config --global user.name "Sara Ahmed"
git config --global user.email "you@example.com"
```

Use the same email address as your GitHub account so your commits are linked to your profile.

## The everyday workflow

```text
your folder ──git add──▶ staging area ──git commit──▶ local history ──git push──▶ GitHub
     ◀───────────────────────────────── git pull ───────────────────────────────────┘
```

### 1. Clone: copy the repository to your computer

On GitHub, open your repository, click the green **Code** button and copy the HTTPS address. Then:

```bash
git clone https://github.com/your-username/hello-world.git
cd hello-world
```

You now have a `hello-world` folder with all the files and the full history.

### 2. Change something, then check the status

Edit `README.md` in your editor and save it. Then ask Git what changed:

```bash
git status
```

Git lists `README.md` as *modified*.

### 3. Stage and commit

Choose which changes go into the next commit (this is called **staging**), then commit them:

```bash
git add README.md
git commit -m "Add hobbies section to README"
```

`git add .` stages every changed file in the folder at once.

### 4. Push: send your commits to GitHub

```bash
git push
```

The first time, Git asks you to sign in to GitHub, usually by opening a browser window. Your normal GitHub password won't work when typed into the terminal; follow the browser sign-in instead. Git for Windows does this through a tool called Git Credential Manager. On other systems, installing the GitHub CLI and running `gh auth login` sets it up.

Refresh your repository on GitHub: your commit is there.

### 5. Pull: get changes made elsewhere

If you (or a teammate) changed something on GitHub, bring it down to your computer before you start working:

```bash
git pull
```

## Keeping files out of Git

Some files shouldn't be shared, like passwords, large downloads or files your editor creates. List them in a file called `.gitignore` in your project folder:

```text
secrets.txt
*.log
node_modules/
```

Git will act as if those files don't exist.

> Never commit passwords or secret keys, even in a private repository. If it happens by accident, change the password straight away: deleting the file later doesn't remove it from the history.

:::quiz
Q: What does `git clone` do?
- [x] Downloads a copy of a GitHub repository, with its history, to your computer
- [ ] Uploads your commits to GitHub
- [ ] Creates a new branch
Why: Cloning makes a local copy you can work on. You only clone a repository once.

Q: Put the everyday steps in order after editing a file.
- [ ] `git push`, then `git add`, then `git commit`
- [x] `git add`, then `git commit`, then `git push`
- [ ] `git commit`, then `git push`, then `git add`
Why: Stage the changes, save them as a commit, then send the commit to GitHub.

Q: Which file tells Git which files to ignore?
- [ ] `README.md`
- [ ] `ignore.txt`
- [x] `.gitignore`
Why: Git reads `.gitignore` and skips any file or folder that matches the patterns in it.
:::
