A **program** is a list of instructions for a computer. The computer follows them exactly, one after another, very fast, and without guessing what you meant.

That last part matters. If you tell a friend "grab me a drink", they'll figure out the details. A computer needs every step spelled out.

## Your first Python program

```python
print("Hello, world!")
```

`print` is a **function**: a named command that does a job. This one shows text on the screen. The text goes inside the brackets, between quotation marks.

## Where to run Python

You don't need to install anything to start:

- **In your browser:** open an online Python editor such as [Trinket](https://trinket.io/python3) or [Replit](https://replit.com), paste the code, and press **Run**.
- **On your computer:** install Python from [python.org](https://www.python.org/downloads/), which comes with a simple editor called IDLE. Create a new file, save it as `hello.py`, and press **F5** to run it.

## Programs run from top to bottom

```python
print("First")
print("Second")
print("Third")
```

Output:

```text
First
Second
Third
```

## When things go wrong

Try running this:

```python
print("Hello"
```

Python stops and shows an **error message**. Errors are normal, and every programmer sees them all day. Read the last line of the message: it usually tells you what's wrong and on which line. Here, a closing bracket is missing.

:::quiz
Q: What does `print("Hi")` do?
- [ ] Sends "Hi" to a printer
- [x] Shows Hi on the screen
- [ ] Saves "Hi" to a file
Why: In Python, `print` displays text in the output area. It has nothing to do with paper printers.

Q: In what order does Python run the lines of a simple program?
- [x] From top to bottom, one at a time
- [ ] All at the same time
- [ ] Shortest line first
Why: Python reads and runs your code line by line, starting at the top.
:::
