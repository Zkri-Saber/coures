Here's the secret to CSS layout: **every element is a box**. Once you see the boxes, layout becomes much easier.

## The box model

Each box has four layers, from the inside out:

1. **Content**: the text or image itself
2. **Padding**: space between the content and the border
3. **Border**: a line around the padding (can be invisible)
4. **Margin**: space outside the border, pushing other boxes away

```css
.card {
  padding: 16px;
  border: 2px solid #333;
  margin: 24px 0;
  border-radius: 8px;   /* rounded corners */
}
```

> Try it: right-click an element and choose **Inspect**. Your browser's developer tools show the content, padding, border and margin as colored layers.

## Block and inline

- **Block** elements (`<h1>`, `<p>`, `<div>`, `<ul>`) start on a new line and stretch across the full width.
- **Inline** elements (`<a>`, `<strong>`, `<img>`) sit inside a line of text, side by side.

`<div>` is a block with no meaning of its own. It's useful for grouping things so you can style them together.

## Putting boxes side by side with flexbox

To line boxes up in a row, give their parent `display: flex`:

```html
<div class="row">
  <div class="card">HTML</div>
  <div class="card">CSS</div>
  <div class="card">JavaScript</div>
</div>
```

```css
.row {
  display: flex;
  gap: 16px;               /* space between the cards */
  flex-wrap: wrap;         /* move to a new line on small screens */
}

.card {
  flex: 1;                 /* share the space equally */
  min-width: 150px;
}
```

That's enough to build most simple layouts: a row of cards, a header with a logo on one side and links on the other, or a gallery of photos.

:::quiz
Q: Which layer adds space *inside* the border, around the content?
- [x] Padding
- [ ] Margin
- [ ] Gap
Why: Padding is inside the border. Margin is outside it, between this box and its neighbours.

Q: You want three cards in a row. Where do you put `display: flex`?
- [ ] On each card
- [x] On the element that contains the cards
- [ ] On the `<body>` only
Why: Flexbox is set on the parent, and it arranges that parent's children.
:::
