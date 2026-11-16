Have you ever saved files like `essay.docx`, `essay_v2.docx`, `essay_final.docx` and `essay_final_REALLY_final.docx`? Programmers had the same problem, multiplied by hundreds of files and dozens of people. Git and GitHub solve it.

## Git: a time machine for your project

**Git** is a program that tracks changes to the files in a folder. Each time you reach a good point, you save a **snapshot** of the whole project, called a **commit**. Every commit records:

- what changed, line by line
- who changed it
- when
- a short message explaining why

You can look back at any commit, compare versions, and undo mistakes, without ever making `_v2` copies again.

## GitHub: where projects live online

**GitHub** is a website that stores Git projects online and adds tools for working with other people. On GitHub you can:

- back up your projects and reach them from any computer
- work on the same project as classmates without overwriting each other's work
- discuss ideas and track tasks
- show your work to teachers, universities and future employers
- publish websites for free (that's GitHub Pages)

> Think of it this way: **Git is the camera** that takes snapshots of your work. **GitHub is the shared online album** where those snapshots are stored, and where others can see them and add their own.

You can use Git without GitHub, but GitHub is built on top of Git. In this course you'll start on the GitHub website, where Git works behind the scenes, and use Git directly on your computer later.

## Words you'll hear a lot

| Word | Meaning |
| --- | --- |
| Repository (repo) | A project folder tracked by Git, including its full history |
| Commit | A saved snapshot of your changes, with a message |
| Branch | A separate line of work where you can try changes safely |
| Pull request | A request to bring changes from one branch into another, so others can review them first |
| Merge | Combining changes from one branch into another |
| Clone | Downloading a copy of a repository to your computer |
| Push / pull | Sending your commits up to GitHub / bringing new commits down from it |

Don't try to memorise this now. Each word gets its own hands-on lesson.

:::quiz
Q: What is a commit?
- [ ] A copy of the project on another computer
- [x] A saved snapshot of your changes, with a message explaining them
- [ ] A comment someone leaves on your code
Why: A commit records exactly what changed, who changed it, when, and why.

Q: Which statement is true?
- [ ] Git and GitHub are two names for the same thing
- [x] Git tracks changes; GitHub is a website that hosts Git projects and adds teamwork tools
- [ ] GitHub works without Git
Why: Git is the version control program. GitHub stores Git repositories online and adds collaboration features on top.
:::
