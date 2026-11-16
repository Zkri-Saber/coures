You know dozens of commands now. The real magic of Linux is combining them: small tools that each do one job well, connected together.

## Pipes: connect commands

The **pipe** symbol `|` sends the output of one command into the next one, instead of to the screen:

```bash
ls -l /etc | less
```

`ls` lists a long folder, and `less` lets you scroll through the result. More examples:

```bash
ls /usr/bin | wc -l       # how many programs are in /usr/bin?
history | tail -n 10      # your last 10 commands
```

`wc -l` counts lines, so the first example counts the programs installed on your system.

## grep: find text

`grep` searches for a word or phrase and shows only the matching lines:

```bash
grep milk shopping.txt          # lines containing "milk"
grep -i milk shopping.txt       # ignore upper/lower case
grep -r "homework" ~/school     # search every file in a folder
history | grep cd               # every cd command you've typed
```

## find: find files

```bash
find ~ -name "*.txt"
```

This searches your whole home folder (`~`) for files whose names end in `.txt`.

## Your first script

A **script** is a text file full of commands that run one after another. Instead of typing the same commands every day, you write them once.

Create the file:

```bash
nano hello.sh
```

Type this in:

```bash
#!/bin/bash
# My first script

echo "Hello, $USER!"
echo "Today is $(date +%A)."
echo "You are in: $(pwd)"
echo "Files here:"
ls
```

Save with **Ctrl + O**, **Enter**, then exit with **Ctrl + X**.

What it all means:

- `#!/bin/bash` on the first line tells Linux to run the file with **bash**, the shell you've been typing into.
- Lines starting with `#` are comments, for humans only.
- `$USER` is a **variable** that holds your username.
- `$(...)` runs a command and puts its result in the text. `date +%A` gives the day of the week.

Make it executable and run it:

```bash
chmod +x hello.sh
./hello.sh
```

The `./` means "the file in this folder". Linux doesn't look for programs in the current folder unless you say so, which protects you from running something by accident.

## Asking the user a question

`read` waits for the user to type something and saves it in a variable:

```bash
#!/bin/bash
read -p "What's your name? " name
echo "Nice to meet you, $name!"
```

## Well done

You've gone from your first `echo` to writing scripts. Your final project, on the course page, asks you to combine what you've learned into a script of your own.

:::quiz
Q: What does the `|` symbol do in `history | grep cd`?
- [ ] Runs both commands at the same time, separately
- [x] Sends the output of `history` into `grep`
- [ ] Saves the history to a file called `grep`
Why: A pipe passes one command's output to the next command as its input.

Q: Why do you type `./hello.sh` instead of just `hello.sh`?
- [ ] The dot makes it run faster
- [x] Linux doesn't search the current folder for programs unless you tell it to
- [ ] Scripts must always start with a dot
Why: `./` points to the current folder, so Linux knows exactly which file you mean.

Q: In a script, what does `$USER` contain?
- [x] Your username
- [ ] The word USER
- [ ] Your password
Why: `$USER` is a variable that Linux sets to the name of the logged-in user.
:::
