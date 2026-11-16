HTML is written with **tags**: words inside angle brackets that label each piece of content. Most tags come in pairs, an opening tag and a closing tag with a slash.

```html
<h1>This is a big heading</h1>
<p>This is a paragraph.</p>
```

The opening tag, the content and the closing tag together are called an **element**.

## A complete page

Open a plain text editor (VS Code, Notepad or TextEdit in plain-text mode), paste this in, and save it as `index.html`.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>My first page</title>
  </head>
  <body>
    <h1>Hello, I'm Sam</h1>
    <p>I'm learning to build websites.</p>

    <h2>Things I like</h2>
    <ul>
      <li>Football</li>
      <li>Drawing</li>
      <li>Space</li>
    </ul>

    <p>Visit <a href="https://www.wikipedia.org">Wikipedia</a> to learn more.</p>
  </body>
</html>
```

Now double-click the file. It opens in your browser: you just made a web page.

## What each part does

- `<head>` holds information *about* the page, like the title shown on the browser tab. It isn't shown on the page itself.
- `<body>` holds everything visitors see.
- `<h1>` to `<h6>` are headings, from most to least important. Use one `<h1>` per page.
- `<ul>` makes a bulleted list, and each `<li>` is one item.
- `<a href="...">` makes a link. The `href` part is an **attribute**: extra information you add inside the opening tag.

## Adding an image

Put an image file next to your `index.html`, then add:

```html
<img src="cat.jpg" alt="My grey cat sleeping on a chair">
```

`<img>` has no closing tag. The `alt` text describes the image for people who can't see it, so always write one.

:::quiz
Q: Which element should hold the main heading of your page?
- [ ] `<head>`
- [x] `<h1>`
- [ ] `<h6>`
Why: `<h1>` is the most important heading. `<head>` is a different thing: the invisible information section at the top of the file.

Q: In `<a href="https://example.com">Click</a>`, what is `href`?
- [ ] A tag
- [x] An attribute
- [ ] A closing tag
Why: Attributes go inside the opening tag and add information, here the address the link goes to.

Q: Why should every image have `alt` text?
- [ ] It makes the image load faster
- [ ] It adds a caption under the image
- [x] It describes the image for people who can't see it
Why: Screen readers read the alt text aloud, and browsers show it if the image fails to load.
:::
