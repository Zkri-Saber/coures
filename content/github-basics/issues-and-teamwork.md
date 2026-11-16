Code is only part of a project. You also need to keep track of what to do next, what's broken, and who's doing what. On GitHub that happens in **issues**.

## What is an issue?

An issue is like a to-do card attached to your repository. Use one for:

- a bug: *The contact link goes to the wrong page*
- a task: *Add a photo gallery*
- an idea or a question: *Should we use a dark background?*

## Create an issue

1. Open the **Issues** tab of your repository.
2. Click **New issue**.
3. Write a clear title and a description. Describe what's wrong or what's needed, and how you'll know it's done.
4. Create the issue.

GitHub gives every issue a number, like `#1`. Issues are written in Markdown, so you can add a checklist:

```markdown
To finish the gallery:
- [ ] Choose 6 photos
- [ ] Resize them
- [ ] Add captions
```

Each `- [ ]` becomes a box you can tick.

On the right side of an issue you can set:

- **Assignees**: who is working on it
- **Labels**: tags like `bug`, `enhancement` or `good first issue`

## Close issues with a pull request

When a pull request fixes an issue, write this in the pull request's description:

```text
Closes #1
```

When the pull request is merged, GitHub closes issue #1 automatically and links the two together. Anyone can later see which change fixed which problem.

## Talking to each other

- Comment on issues and pull requests to discuss them.
- Type `@` followed by a username, like `@sara-codes`, to mention someone. They'll get a notification.
- Be kind and specific. "Line 12 links to `contact.htm` but the file is `contact.html`" is far more helpful than "the link is broken".

## Inviting teammates

To let a classmate commit to your repository:

1. Go to the repository's **Settings**, then **Collaborators**.
2. Click **Add people** and enter their username.
3. They'll get an invitation to accept.

## Contributing to other people's projects

You can't commit to a repository you don't have access to, but you can **fork** it. A fork is your own copy of someone else's repository, in your account. You make changes in your fork, then open a pull request to suggest them to the original project. This is how people around the world contribute to open-source software.

:::quiz
Q: Your classmate found a bug on your website. Where should they report it?
- [ ] In a commit message
- [x] In a new issue
- [ ] By editing `main` directly
Why: Issues are for tracking bugs, tasks and ideas. They keep the discussion in one place, attached to the project.

Q: What happens if a merged pull request's description says `Closes #4`?
- [x] Issue #4 is closed automatically
- [ ] Pull request #4 is deleted
- [ ] The repository is closed to new changes
Why: GitHub recognises keywords like "Closes" and closes the linked issue when the pull request is merged.

Q: What is a fork?
- [ ] A branch inside your own repository
- [x] Your own copy of someone else's repository
- [ ] A merge that went wrong
Why: Forking copies another person's repository into your account so you can change it and propose your changes with a pull request.
:::
