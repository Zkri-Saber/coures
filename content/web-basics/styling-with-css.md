Your page works, but it looks plain. CSS fixes that. A CSS file is a list of **rules**, and each rule says which elements to change and how.

```css
h1 {
  color: darkgreen;
  font-family: Georgia, serif;
}
```

- `h1` is the **selector**: which elements this rule applies to.
- `color` and `font-family` are **properties**: what to change.
- `darkgreen` and `Georgia, serif` are **values**.

Every line ends with a semicolon, and the whole rule sits inside curly braces.

## Connecting CSS to your page

Create a file called `style.css` in the same folder as `index.html`. Then add this line inside the `<head>` of your HTML:

```html
<link rel="stylesheet" href="style.css">
```

Save both files and refresh the browser.

## Useful properties to start with

```css
body {
  font-family: Arial, sans-serif;
  background-color: #f5f7fa;
  color: #222;
  max-width: 700px;
  margin: 0 auto;      /* centers the page */
  line-height: 1.6;
}

a {
  color: #0b6bcb;
}
```

Colors can be names (`tomato`), hex codes (`#ff6347`) or `rgb(255, 99, 71)`. They all mean the same thing.

## Classes: style just some elements

Give an element a `class` in your HTML:

```html
<p class="note">Remember to save your files!</p>
```

Then select it in CSS with a dot:

```css
.note {
  background-color: lightyellow;
  padding: 12px;
}
```

Only paragraphs with `class="note"` get the yellow background.

:::quiz
Q: In the rule `p { color: red; }`, what is `p`?
- [x] The selector
- [ ] The property
- [ ] The value
Why: The selector chooses which elements the rule applies to. Here: every paragraph.

Q: How do you select elements with `class="note"` in CSS?
- [ ] `#note`
- [x] `.note`
- [ ] `note`
Why: A dot means "class". A hash (`#`) is for ids, and a bare word selects a tag name.
:::
