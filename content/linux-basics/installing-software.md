On your phone you install apps from an app store. Linux had the same idea long before phones did: a **package manager** downloads software from your distribution's trusted collection (called a **repository**), installs it, and keeps it up to date.

On Ubuntu and Debian, the package manager is called `apt`.

## Update the list first

```bash
sudo apt update
```

This doesn't install anything. It downloads the latest list of available software and versions, so `apt` knows what's out there. Run it before installing.

## Install something

Let's install two small, fun tools:

```bash
sudo apt install tree figlet
```

`apt` shows what it's going to install and asks you to confirm. Type `y` and press Enter. Then try them:

```bash
tree ~          # shows your home folder as a tree
figlet Hello!   # prints Hello! in giant letters
```

## Other useful apt commands

| Command | What it does |
| --- | --- |
| `apt search weather` | Search for packages about "weather" |
| `apt show tree` | Show details about a package |
| `sudo apt upgrade` | Update **all** your installed software |
| `sudo apt remove figlet` | Uninstall a package |

A good habit: run `sudo apt update` and then `sudo apt upgrade` every week or two to get security fixes.

## Why a package manager is better than downloading

- **Safe:** packages come from your distribution's repository, where they're checked and signed.
- **Easy:** one command installs a program and everything it needs to work (its *dependencies*).
- **Up to date:** one command updates every program at once.

## Other distributions and Mac

The idea is the same everywhere; only the command name changes:

| System | Install command |
| --- | --- |
| Ubuntu, Debian, Linux Mint, WSL | `sudo apt install tree` |
| Fedora | `sudo dnf install tree` |
| Arch Linux | `sudo pacman -S tree` |
| Mac (after installing [Homebrew](https://brew.sh)) | `brew install tree` |

> Only install software from your distribution's repository or a source you trust. If a website tells you to paste a long command starting with `sudo` or `curl`, ask your teacher first.

:::quiz
Q: What does `sudo apt update` do?
- [ ] Installs every available program
- [x] Downloads the latest list of available packages
- [ ] Upgrades Linux to a new version
Why: `update` refreshes the list of what's available. `upgrade` is the command that actually updates your installed software.

Q: Why do you need `sudo` in front of `apt install`?
- [x] Installing software changes the system, which needs administrator powers
- [ ] Every Linux command needs `sudo`
- [ ] It makes the download faster
Why: Installing software writes to system folders that normal users can't change.
:::
