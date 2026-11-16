On GitHub, saving a change is called **making a commit**. Each commit becomes a permanent point in your project's history that you can always go back to.

## Edit a file in the browser

1. Open your `hello-world` repository and click `README.md`.
2. Click the **pencil icon** (Edit this file) at the top right of the file.
3. Add a few lines about yourself:

```markdown
# Hello, I'm Sara

I'm learning to use GitHub in Grade 10 Computer Science.

## Things I want to build
- A website about my favourite football team
- A game in Python
```

4. Click the **Preview** tab to see how it will look.
5. Click **Commit changes...**. A dialog opens.
6. Write a **commit message** that says what you changed, for example `Add introduction to README`.
7. Leave **Commit directly to the main branch** selected and click **Commit changes**.

That's your second commit. GitHub made the first one for you when it created the README.

## See the history

Go back to the repository's main page and click the commit count (or the **History** link when viewing a file). You'll see every commit, newest first, with its message, author and time.

Click any commit to see exactly what changed:

- lines shown in **green** with a `+` were added
- lines shown in **red** with a `-` were removed

This view is called a **diff** (short for difference).

## Add new files

From the repository's main page, open the **Add file** menu:

- **Create new file** lets you type a file name and its contents. Typing a `/` in the name creates a folder, so `notes/week1.md` makes a `notes` folder with a file inside.
- **Upload files** lets you drag files from your computer, like images or a whole website.

Both end with the same **Commit changes** step.

## Writing good commit messages

Your future self (and your teammates) will read these messages to understand the history. A good message is short and says *what* the change does.

| Not helpful | Helpful |
| --- | --- |
| `update` | `Add contact section to README` |
| `stuff` | `Fix broken link to my blog` |
| `asdfgh` | `Upload photos for the gallery page` |

Tip: write it as an instruction, as if finishing the sentence "This commit will...".

:::quiz
Q: In a diff, what does a green line starting with `+` mean?
- [x] The line was added
- [ ] The line was removed
- [ ] The line has an error
Why: Green `+` lines were added in that commit. Red `-` lines were removed.

Q: Which is the best commit message?
- [ ] `changes`
- [ ] `final version!!!`
- [x] `Add list of favourite books to README`
Why: It says exactly what the commit does, so anyone reading the history understands it without opening the files.

Q: How do you create a folder when adding a file on GitHub?
- [ ] Click a "New folder" button
- [x] Type a `/` in the file name, like `notes/week1.md`
- [ ] Folders can only be made on your computer
Why: GitHub creates folders from the path you type. Git only tracks folders that contain at least one file.
:::
