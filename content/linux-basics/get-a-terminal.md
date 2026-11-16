You don't need to replace your computer's operating system to learn Linux. Pick the option below that matches your device. If you're on a school computer, ask your teacher first: some of these need administrator rights.

## Windows 10 or 11: WSL

**WSL** (Windows Subsystem for Linux) runs a real Ubuntu system inside Windows.

1. Click **Start**, type `PowerShell`, right-click **Windows PowerShell** and choose **Run as administrator**.
2. Type this command and press Enter:

```powershell
wsl --install
```

3. Restart your computer when it finishes.
4. Open **Ubuntu** from the Start menu. The first time, it asks you to create a **username** and **password** for Linux. Use lowercase letters for the username, and choose a password you'll remember: you'll need it later.

> When you type a password in the terminal, **nothing appears on screen**, not even dots. That's normal and keeps it private. Just type it and press Enter.

## Chromebook

Many Chromebooks can run Linux. Open **Settings**, search for `Linux`, and turn on the **Linux development environment**. A **Terminal** app appears when it's ready. On school-managed Chromebooks this may be switched off; if so, use the browser option below.

## Mac

Open **Terminal** (in Applications, then Utilities). macOS isn't Linux, but they share the same Unix roots, so almost every command in this course works the same way. The one exception is the lesson on installing software, which uses a different tool on a Mac.

## Already on Linux?

Open the **Terminal** app. On Ubuntu, the shortcut is `Ctrl + Alt + T`.

## Any device: a terminal in your browser

Free websites such as [Webminal](https://webminal.org) give you a Linux terminal in a browser tab. They're perfect for practising, but don't use them for anything private, and never type real passwords into them.

## Check it works

You should see a line ending in `$` with a blinking cursor. That's the **prompt**: Linux waiting for your command. Type this and press Enter:

```bash
echo Hello, Linux!
```

If the terminal prints `Hello, Linux!` back to you, you're ready for the next lesson.

:::quiz
Q: What does `wsl --install` do on Windows?
- [ ] Replaces Windows with Linux
- [x] Installs a Linux system (Ubuntu by default) that runs inside Windows
- [ ] Opens a Linux website
Why: WSL runs Linux alongside Windows, so you keep all your Windows apps and files.

Q: You're asked for your password in the terminal, but nothing appears as you type. What's happening?
- [ ] The keyboard is broken
- [ ] You need to click on the terminal first
- [x] It's normal: Linux hides passwords as you type them
Why: The terminal deliberately shows nothing while you type a password. Type it carefully and press Enter.
:::
