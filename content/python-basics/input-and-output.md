Programs get interesting when they respond to the person using them. The `input` function asks a question and waits for an answer.

```python
name = input("What's your name? ")
print("Nice to meet you, " + name + "!")
```

Whatever the user types is stored in the variable `name`.

## Input is always text

`input` always gives you a **string**, even if the user types a number. That causes a classic bug:

```python
age = input("How old are you? ")
print(age + 1)    # error!
```

Python can't add the number 1 to text. Convert the answer first with `int()`:

```python
age = int(input("How old are you? "))
print("Next year you'll be", age + 1)
```

Use `float()` instead of `int()` if you expect a decimal number.

## Printing several things

You can give `print` several values separated by commas. It puts a space between them for you:

```python
print("You are", age, "years old")
```

Or use an **f-string**: put an `f` before the quotes and write variables inside curly braces.

```python
print(f"Hi {name}, next year you'll be {age + 1}.")
```

f-strings are the neatest way to mix text and values, and most Python programmers use them.

## Try it

Write a program that asks for the length and width of a room in metres, then prints its area.

```python
length = float(input("Length in metres: "))
width = float(input("Width in metres: "))
print(f"The area is {length * width} square metres.")
```

:::quiz
Q: The user types 12 when `input()` runs. What type of value do you get?
- [x] A string: `"12"`
- [ ] An integer: `12`
- [ ] A float: `12.0`
Why: `input` always returns text. Use `int()` or `float()` to turn it into a number.

Q: If `name = "Omar"`, what does `print(f"Hi {name}")` show?
- [ ] `Hi {name}`
- [x] `Hi Omar`
- [ ] `f"Hi Omar"`
Why: In an f-string, anything inside curly braces is replaced by its value.
:::
