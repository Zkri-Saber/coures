In Linux, everything lives in one big tree of folders (Linux people often say **directories**). There are no drive letters like `C:`. The tree starts at the very top, called the **root**, written as a single `/`.

```text
/                  ← the root: everything starts here
├── home/
│   └── sara/      ← your home folder (~)
├── etc/           ← system settings
├── usr/
│   └── bin/       ← most programs live here
└── tmp/           ← temporary files
```

## Where am I?

```bash
pwd
```

`pwd` (print working directory) shows the folder you're in right now, for example `/home/sara`.

## What's here?

```bash
ls
```

`ls` lists what's in the current folder. Two useful options:

```bash
ls -l      # long list: sizes, dates and permissions
ls -a      # show hidden files too
```

Files whose names start with a dot, like `.bashrc`, are **hidden**. They're usually settings files. You can combine options: `ls -la`.

> If your home folder looks empty, that's normal on a brand-new system. You'll create files and folders in the next lesson.

## Moving around

`cd` (change directory) moves you to another folder:

```bash
cd /etc        # go to the etc folder
ls             # see what's in it
cd ..          # go up one level (to /)
cd ~           # go back home
```

Some shortcuts:

| You type | It means |
| --- | --- |
| `~` | Your home folder. Plain `cd` also takes you home |
| `..` | The folder one level up |
| `.` | The current folder |
| `/` | The root of the whole tree |
| `cd -` | Go back to the folder you were in before |

## Absolute and relative paths

A **path** describes where a file or folder is.

- An **absolute path** starts with `/` and works from anywhere: `/home/sara/projects`
- A **relative path** starts from where you are now: if you're in `/home/sara`, then `projects` means the same thing.

It's like giving directions: "the library at 12 Main Street" (absolute) or "two doors down from here" (relative).

## Names with spaces

The terminal uses spaces to separate parts of a command, so a folder called `My Files` confuses it. Put the name in quotes:

```bash
cd "My Files"
```

Even better, avoid spaces in names. Use dashes or underscores instead: `my-files`.

> On WSL, your Windows drives are inside Linux too: `C:` is at `/mnt/c`. Try `ls /mnt/c/Users`.

:::quiz
Q: Which command shows the folder you are in right now?
- [x] `pwd`
- [ ] `ls`
- [ ] `cd`
Why: `pwd` prints the working directory. `ls` lists its contents, and `cd` moves you somewhere else.

Q: You're in `/home/sara/projects`. Where does `cd ..` take you?
- [ ] `/`
- [x] `/home/sara`
- [ ] `/home/sara/projects/..`
Why: `..` means one level up, so you move from `projects` to its parent folder, `/home/sara`.

Q: Which of these is an absolute path?
- [ ] `projects/website`
- [ ] `../photos`
- [x] `/home/sara/photos`
Why: Absolute paths start with `/`, the root, so they point to the same place wherever you are.
:::
