So far every line of your programs runs every time. An `if` statement lets the program choose what to do.

```python
temperature = 34

if temperature > 30:
    print("It's hot. Drink some water!")
```

The indented line only runs when the condition is `True`.

## Indentation matters

Python uses indentation (4 spaces) to know which lines belong to the `if`. Everything indented under it is part of the same block:

```python
if temperature > 30:
    print("It's hot.")
    print("Stay in the shade.")
print("This line always runs.")
```

Don't forget the colon `:` at the end of the `if` line.

## Comparing values

| Symbol | Meaning |
| --- | --- |
| `==` | is equal to |
| `!=` | is not equal to |
| `>` / `<` | greater than / less than |
| `>=` / `<=` | greater than or equal / less than or equal |

Note the double `==`. A single `=` stores a value; `==` compares two values.

## else and elif

`else` runs when the condition is false. `elif` (short for "else if") checks another condition:

```python
score = int(input("Your test score: "))

if score >= 90:
    print("Excellent!")
elif score >= 70:
    print("Good work.")
elif score >= 50:
    print("You passed.")
else:
    print("Let's practise together.")
```

Python checks each condition from top to bottom and runs **only the first one** that's true.

## Combining conditions

Use `and`, `or` and `not`:

```python
if age >= 13 and age <= 19:
    print("You're a teenager.")
```

:::quiz
Q: What's wrong with `if score = 100:`?
- [ ] Nothing, it works
- [x] It should use `==` to compare
- [ ] `if` needs brackets around the condition
Why: A single `=` stores a value. Comparisons need `==`.

Q: `score` is 95. Which message is printed by the example with `elif`?
- [x] Only "Excellent!"
- [ ] "Excellent!", "Good work." and "You passed."
- [ ] "Good work."
Why: Python runs only the first block whose condition is true, then skips the rest.

Q: How does Python know which lines belong to an `if`?
- [ ] They're inside curly braces
- [x] They're indented under it
- [ ] They're on the same line
Why: Indentation defines blocks in Python. Use 4 spaces.
:::
