A **loop** repeats a block of code. Instead of writing `print` ten times, you write it once and tell Python how many times to run it.

## for loops: repeat a set number of times

```python
for i in range(5):
    print("Hello!")
```

This prints Hello! five times. `range(5)` gives the numbers 0, 1, 2, 3, 4, and `i` holds each one in turn:

```python
for i in range(1, 6):
    print(i, "x 7 =", i * 7)
```

`range(1, 6)` starts at 1 and stops **before** 6, so this prints the 7 times table from 1 to 5.

## Looping over a list

A **list** holds several values in square brackets. A `for` loop can visit each one:

```python
fruits = ["apple", "banana", "mango"]
for fruit in fruits:
    print("I like", fruit)
```

## while loops: repeat until something changes

A `while` loop keeps going as long as its condition is true:

```python
count = 3
while count > 0:
    print(count)
    count = count - 1
print("Lift off!")
```

> Be careful: if the condition never becomes false, the loop runs forever. If that happens, stop the program (in most editors press **Ctrl + C** or the stop button).

## Putting it together: a guessing game

This is the start of your final project. Read it line by line and predict what it does before you run it.

```python
import random

secret = random.randint(1, 20)
guess = 0

while guess != secret:
    guess = int(input("Guess a number from 1 to 20: "))
    if guess < secret:
        print("Too low.")
    elif guess > secret:
        print("Too high.")

print("You got it!")
```

Ideas to make it yours: count how many guesses it took, limit the player to 5 tries, or ask if they want to play again.

:::quiz
Q: Which numbers does `range(3)` give?
- [x] 0, 1, 2
- [ ] 1, 2, 3
- [ ] 0, 1, 2, 3
Why: `range(3)` starts at 0 and stops before 3.

Q: When should you use a `while` loop instead of a `for` loop?
- [ ] When you know exactly how many times to repeat
- [x] When you repeat until something happens, like a correct guess
- [ ] Never, `for` loops can do everything
Why: `while` is for repeating until a condition changes. `for` is best when you know the count or have a list to go through.
:::
