Linux was designed for many people sharing one computer, so every file has an **owner** and rules about who can do what with it. These rules are called **permissions**.

## Reading permissions

Run `ls -l` in a folder with some files:

```text
-rw-r--r-- 1 sara sara  120 Nov 16 10:02 notes.txt
drwxr-xr-x 2 sara sara 4096 Nov 16 10:05 projects
```

The first column is the permission string. Split it into four parts:

```text
-    rw-    r--    r--
│     │      │      └── others (everyone else)
│     │      └───────── group
│     └──────────────── owner (sara)
└────────────────────── type: - for a file, d for a directory
```

Each group of three letters says what's allowed:

| Letter | For a file | For a folder |
| --- | --- | --- |
| `r` read | Open and read it | List what's inside |
| `w` write | Change it | Add or delete files inside |
| `x` execute | Run it as a program | Enter it with `cd` |
| `-` | Not allowed | Not allowed |

So `-rw-r--r--` means: the owner can read and write; everyone else can only read.

## Changing permissions with chmod

`chmod` (change mode) changes permissions. The most common use is making a script runnable:

```bash
chmod +x myscript.sh
```

`+x` adds execute permission; `-x` removes it. You can target specific people: `u` (user/owner), `g` (group), `o` (others):

```bash
chmod o-r notes.txt    # others can no longer read it
```

You'll also see numbers, like `chmod 755`. Each digit is the sum of read (4), write (2) and execute (1), for owner, group and others in that order. So `755` means `rwxr-xr-x`, and `644` means `rw-r--r--`.

## The superuser: root

Linux has one all-powerful account called **root**. It can read, change and delete anything, including the files that keep the system running. Normal users can't, which protects the system from accidents and from harmful programs.

When you do need to make a system change, like installing software, you use `sudo` ("superuser do") to run **one** command with root's powers:

```bash
sudo apt update
```

Linux asks for **your** password (the one you created when you set up Linux), then runs the command as root.

> Treat `sudo` with respect. Never run a `sudo` command you don't understand, especially one copied from a random website. A single wrong command can damage your system.

## "Permission denied"

This error means you tried something your user isn't allowed to do. Ask yourself:

- Is it a system file? Then you may need `sudo`, but only if you're sure.
- Is it a script you're trying to run? It probably needs `chmod +x`.
- Is it someone else's file? Then leave it alone.

:::quiz
Q: A file shows `-rwxr--r--`. What can the owner do with it?
- [ ] Only read it
- [ ] Read and write it
- [x] Read, write and run it
Why: The owner's three letters are `rwx`: read, write and execute.

Q: What does `chmod +x hello.sh` do?
- [x] Lets you run `hello.sh` as a program
- [ ] Deletes `hello.sh`
- [ ] Makes `hello.sh` hidden
Why: `+x` adds execute permission, which a script needs before you can run it.

Q: When should you use `sudo`?
- [ ] For every command, to avoid errors
- [x] Only when a command needs administrator powers and you understand what it does
- [ ] Never: it's only for hackers
Why: `sudo` gives a command full control of the system, so use it only when needed and only for commands you understand.
:::
