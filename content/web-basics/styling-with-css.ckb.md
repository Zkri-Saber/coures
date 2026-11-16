پەڕەکەت کار دەکات، بەڵام سادە دەردەکەوێت. CSS ئەمە چاک دەکات. فایلێکی CSS لیستێکە لە **یاسا** (rule)، و هەر یاسایەک دەڵێت کام توخمانە بگۆڕدرێن و چۆن.

```css
h1 {
  color: darkgreen;
  font-family: Georgia, serif;
}
```

- `h1` **هەڵبژێر** (selector) ـە: یاساکە بۆ کام توخمانەیە.
- `color` و `font-family` **تایبەتمەندی** (property) ن: چی بگۆڕدرێت.
- `darkgreen` و `Georgia, serif` **بەها** (value) ن.

هەموو دێڕێک بە خاڵبۆر (;) کۆتایی دێت، و هەموو یاساکە لەناو کەوانەی لوولدار `{ }` دایە.

## بەستنەوەی CSS بە پەڕەکەتەوە

فایلێک بە ناوی `style.css` لە هەمان فۆڵدەری `index.html` دروست بکە. پاشان ئەم دێڕە لەناو `<head>` ـی HTML ـەکەتدا زیاد بکە:

```html
<link rel="stylesheet" href="style.css">
```

هەردوو فایلەکە پاشەکەوت بکە و وێبگەڕەکە نوێ بکەرەوە.

## تایبەتمەندییە بەسوودەکان بۆ دەستپێکردن

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

ڕەنگەکان دەتوانن ناو بن (`tomato`)، کۆدی hex بن (`#ff6347`) یان `rgb(255, 99, 71)`. هەموویان هەمان مانایان هەیە.

## پۆلەکان: تەنها هەندێک توخم شێوە بدە

`class` ـێک بدە بە توخمێک لە HTML ـەکەتدا:

```html
<p class="note">Remember to save your files!</p>
```

پاشان لە CSS دا بە خاڵێک (.) هەڵیبژێرە:

```css
.note {
  background-color: lightyellow;
  padding: 12px;
}
```

تەنها ئەو پەرەگرافانەی `class="note"` یان هەیە باکگراوندی زەرد وەردەگرن.

:::quiz
Q: لە یاسای `p { color: red; }` دا، `p` چییە؟
- [x] هەڵبژێرەکە (selector)
- [ ] تایبەتمەندییەکە (property)
- [ ] بەهاکە (value)
Why: هەڵبژێر دیاری دەکات یاساکە بۆ کام توخمانەیە. لێرەدا: هەموو پەرەگرافەکان.

Q: چۆن لە CSS دا ئەو توخمانە هەڵدەبژێریت کە `class="note"` یان هەیە؟
- [ ] `#note`
- [x] `.note`
- [ ] `note`
Why: خاڵ واتە "پۆل" (class). نیشانەی `#` بۆ ناسنامەیە (id)، و وشەیەکی ڕووت ناوی تاگ هەڵدەبژێرێت.
:::
