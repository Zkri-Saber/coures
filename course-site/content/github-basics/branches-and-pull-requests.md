So far you've committed straight to `main`, the main version of your project. That's fine when you work alone on small changes. But what if you want to try something risky, or several people are working at once? You use a **branch**.

## What is a branch?

A branch is a separate copy of your project where you can make changes without touching `main`. When you're happy with the changes, you ask to bring them into `main` with a **pull request**.

```text
main           ●───●──────────────●   ← merged
                    \            /
readme-edits         ●────●────●
                   (your changes)
```

This is how almost every software team works, and it's called the **GitHub flow**:

1. Create a branch
2. Make commits on it
3. Open a pull request
4. Discuss and review
5. Merge into `main`

## Step 1: Create a branch

1. Open your `hello-world` repository on the **Code** tab.
2. Click the branch menu that says `main`.
3. Type a name for your branch: `readme-edits`.
4. Click **Create branch: readme-edits from main**.

GitHub switches you to the new branch. Check that the branch menu now says `readme-edits`.

## Step 2: Commit on the branch

1. Open `README.md` and click the pencil icon.
2. Add a new section, for example a list of three facts about you.
3. Click **Commit changes...**, write a message, and commit.

Now switch the branch menu back to `main` and open the README. Your new section isn't there: the change only exists on `readme-edits` so far.

## Step 3: Open a pull request

1. Click the **Pull requests** tab.
2. Click **New pull request**.
3. Choose `readme-edits` as the branch to compare with `main`.
4. Look at the diff: these are the changes you're proposing.
5. Click **Create pull request**.
6. Give it a clear title and a short description of what you changed and why.
7. Click **Create pull request** again.

> Shortcut: after you commit to a new branch, GitHub often shows a yellow banner with a **Compare & pull request** button. It does the same thing.

## Step 4: Review

A pull request is a conversation. On a team, others would read your changes in the **Files changed** tab, leave comments on specific lines, and approve them or ask for changes. If changes are needed, you just make more commits on the same branch and they appear in the pull request automatically.

Try it: leave a comment on your own pull request.

## Step 5: Merge

1. At the bottom of the pull request, click **Merge pull request**.
2. Click **Confirm merge**.
3. Click **Delete branch**. The branch's work is now safely in `main`, so you don't need it anymore.

Open the **Code** tab: your README on `main` now includes the new section.

:::quiz
Q: Why make changes on a branch instead of directly on `main`?
- [ ] Branches make the website load faster
- [x] So you can work and get feedback without changing the main version until it's ready
- [ ] GitHub doesn't allow commits to `main`
Why: Branches keep unfinished or experimental work separate. `main` only changes when you merge.

Q: You opened a pull request, and your teacher asks you to fix a typo. What do you do?
- [ ] Close the pull request and start again
- [x] Commit the fix to the same branch; it appears in the pull request automatically
- [ ] Edit the file on `main` instead
Why: A pull request follows its branch. New commits on the branch are added to it.

Q: What does merging a pull request do?
- [ ] Deletes the changes
- [x] Brings the branch's commits into `main`
- [ ] Creates a new repository
Why: Merging combines the changes from your branch into the target branch, usually `main`.
:::
