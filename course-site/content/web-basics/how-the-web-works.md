Every website you visit is a set of files stored on a computer somewhere else in the world. Your browser's job is to fetch those files and turn them into the page you see.

## From address to page

When you type an address like `example.com` and press Enter, four things happen in about a second:

1. **Find the server.** Your browser asks a DNS server (the internet's phone book) for the numeric address of the computer that holds the site.
2. **Ask for the page.** Your browser connects to that computer, called a *server*, and requests the page using HTTPS.
3. **Receive the files.** The server sends back text files: HTML, CSS and often JavaScript, plus any images.
4. **Draw the page.** Your browser reads the files and paints the page on your screen.

> Try it: right-click any web page and choose **View page source**. Everything you see there is HTML, the same language you'll write in the next lesson.

## The three languages of the web

| Language | Job | Think of it as |
| --- | --- | --- |
| HTML | The content and its structure: headings, paragraphs, images, links | The walls and rooms of a house |
| CSS | How it looks: colors, fonts, spacing, layout | The paint and furniture |
| JavaScript | How it behaves: buttons that react, content that changes | The electricity and plumbing |

In this course you'll use the first two. Many great websites use very little JavaScript at all.

:::quiz
Q: What does a web server send to your browser?
- [ ] A picture of the finished page
- [x] Files such as HTML, CSS and images
- [ ] Only the address of the page
Why: The server sends files. Your browser does the work of turning them into the page you see.

Q: Which language controls the colors and fonts of a page?
- [ ] HTML
- [x] CSS
- [ ] JavaScript
Why: CSS describes how things look. HTML describes what the content is.
:::
