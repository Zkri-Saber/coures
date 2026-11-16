A **variable** is a name that stores a value so you can use it later. Think of it as a labelled box.

```python
name = "Layla"
age = 15
print(name)
print(age)
```

The `=` sign means "store this value in this name". It doesn't mean "equals" like in maths.

## Changing a variable

A variable can be given a new value at any time:

```python
score = 0
score = score + 10
print(score)   # shows 10
```

Read the second line from right to left: take `score`, add 10, and store the result back in `score`.

Anything after a `#` is a **comment**. Python ignores it; it's a note for humans.

## Types of values

| Type | What it holds | Examples |
| --- | --- | --- |
| `str` (string) | Text, always in quotes | `"hello"`, `'Baghdad'`, `"42"` |
| `int` (integer) | Whole numbers | `7`, `-3`, `2026` |
| `float` | Numbers with a decimal point | `3.14`, `0.5` |
| `bool` (boolean) | True or false | `True`, `False` |

The type matters. Watch what happens here:

```python
print(2 + 3)       # 5
print("2" + "3")   # 23
```

Adding two numbers does maths. "Adding" two strings joins them together.

## Naming rules

- Use letters, numbers and underscores: `high_score`, `player2`
- Don't start with a number: `2player` is an error
- Names are case-sensitive: `Score` and `score` are different variables
- Pick names that explain themselves: `total_price` beats `tp`

:::quiz
Q: After this code runs, what is stored in `x`? `x = 5` then `x = x * 2`
- [ ] 5
- [x] 10
- [ ] 52
Why: The second line takes the current value (5), multiplies it by 2, and stores 10 back in `x`.

Q: What does `print("4" + "4")` show?
- [ ] 8
- [x] 44
- [ ] An error
Why: The quotes make them strings, and `+` joins strings together.

Q: Which of these is a valid variable name?
- [ ] `1st_place`
- [ ] `my score`
- [x] `first_place`
Why: Names can't start with a number or contain spaces. Underscores are fine.
:::
