Time to create things. Start in your home folder (type `cd` on its own to go there).

## Make folders

```bash
mkdir projects
mkdir -p school/maths/homework
```

`mkdir` makes a directory. The `-p` option creates all the folders in the path at once, even if the parent folders don't exist yet.

## Make files

```bash
touch notes.txt
```

`touch` creates an empty file. To put some text in a file straight away, use `echo` with `>`:

```bash
echo "Buy milk" > shopping.txt
echo "Buy bread" >> shopping.txt
```

- `>` writes into the file, **replacing** anything that was there.
- `>>` **adds** to the end of the file.

## Read files

```bash
cat shopping.txt     # print the whole file
less /etc/services   # scroll through a long file (q to quit)
head -n 5 /etc/services   # just the first 5 lines
tail -n 5 /etc/services   # just the last 5 lines
```

## Edit files with nano

`nano` is a simple text editor that runs inside the terminal:

```bash
nano notes.txt
```

Type whatever you like, then:

- **Ctrl + O**, then **Enter**, to save ("write Out")
- **Ctrl + X** to exit

The shortcuts are listed at the bottom of the nano screen. `^` means the Ctrl key.

## Copy, move and rename

```bash
cp notes.txt notes-backup.txt      # copy a file
cp -r projects projects-copy       # copy a folder and everything in it
mv notes-backup.txt school/        # move a file into a folder
mv shopping.txt groceries.txt      # rename a file
```

There's no separate "rename" command: renaming is just moving a file to a new name.

## Delete

```bash
rm groceries.txt          # delete a file
rmdir projects-copy       # delete an empty folder
rm -r projects-copy       # delete a folder and everything inside it
```

> **Careful:** the terminal has no recycle bin. Deleted files are gone for good. Add `-i` (`rm -i`) and Linux will ask you to confirm each file first. Always double-check `rm -r` commands before pressing Enter.

## Wildcards

The `*` symbol matches any characters, so you can work with many files at once:

```bash
ls *.txt          # every file ending in .txt
cp *.jpg photos/  # copy every .jpg into photos
```

Run `ls` with a wildcard first to see which files it matches, *before* using it with `rm`.

## Practice

Build this structure using only the terminal, then check it with `ls -R school`:

```text
school/
├── maths/
│   └── homework.txt   (containing the word "fractions")
└── science/
    └── lab-notes.txt  (write two lines in nano)
```

:::quiz
Q: What's the difference between `>` and `>>`?
- [ ] There is no difference
- [x] `>` replaces the file's contents; `>>` adds to the end
- [ ] `>` creates folders; `>>` creates files
Why: A single `>` overwrites the file. Use `>>` when you want to keep what's already there.

Q: How do you rename `draft.txt` to `essay.txt`?
- [ ] `rename draft.txt essay.txt`
- [x] `mv draft.txt essay.txt`
- [ ] `cp draft.txt essay.txt`
Why: Renaming is moving a file to a new name, so you use `mv`. `cp` would leave you with two files.

Q: You delete a file with `rm`. Where can you get it back from?
- [ ] The recycle bin
- [ ] The `~/deleted` folder
- [x] Nowhere: it's permanently deleted
Why: `rm` doesn't use a recycle bin. Use `rm -i` if you want Linux to ask before deleting.
:::
