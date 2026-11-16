Open your terminal. You'll see the **prompt**, which looks something like this:

```text
sara@laptop:~$
```

| Part | Meaning |
| --- | --- |
| `sara` | Your username |
| `laptop` | The computer's name |
| `~` | The folder you're in (`~` means your home folder) |
| `$` | Linux is ready for a command |

## Try some commands

Type each one and press **Enter**:

```bash
whoami
date
echo I am learning Linux
```

- `whoami` prints your username.
- `date` shows the date and time.
- `echo` prints back whatever you type after it.

When the screen gets busy, type `clear` to clean it up.

## The shape of a command

Most commands follow the same pattern:

```text
command  -options  arguments
   ls       -l      /home
```

- The **command** is what to do: `ls` lists files.
- **Options** (also called flags) change how it works. They usually start with `-`. Here `-l` means "long format, with details".
- **Arguments** are what to do it to. Here `/home` is the folder to list.

Linux is **case-sensitive**: `ls` works, but `LS` and `Ls` don't.

## Keyboard shortcuts that save time

| Key | What it does |
| --- | --- |
| **Up arrow** | Bring back your previous commands, so you don't retype them |
| **Tab** | Autocomplete. Type the first few letters of a command or file name and press Tab |
| **Ctrl + C** | Stop the command that's running right now |
| **Ctrl + L** | Clear the screen (same as `clear`) |

Use **Tab** all the time. It's faster, and it prevents typing mistakes in long file names.

Type `history` to see a numbered list of every command you've run.

## Getting help

Almost every command has a built-in manual:

```bash
man ls
```

Use the arrow keys to scroll and press **q** to quit. For a shorter summary, many commands accept `--help`:

```bash
ls --help
```

## When it goes wrong

If you see `command not found`, check your spelling and capital letters. If a command seems stuck, press **Ctrl + C**. You can't break anything with the commands in this lesson, so experiment freely.

:::quiz
Q: In the prompt `sara@laptop:~$`, what does `~` mean?
- [ ] The command is still running
- [x] You're in your home folder
- [ ] You are the administrator
Why: `~` is the short name for your home folder, where your personal files live.

Q: In `ls -l /home`, what is `-l`?
- [ ] The command
- [x] An option that changes how the command works
- [ ] The folder being listed
Why: Options usually start with `-`. `-l` tells `ls` to show details in a long list.

Q: A command is taking forever and you want to stop it. What do you press?
- [ ] Tab
- [ ] Up arrow
- [x] Ctrl + C
Why: Ctrl + C stops the running command and gives you the prompt back.
:::
