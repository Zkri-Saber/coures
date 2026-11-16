کاتی دروستکردنی شتەکانە. لە فۆڵدەری ماڵەوەتەوە دەست پێ بکە (بە تەنها `cd` بنووسە بۆ چوونە ئەوێ).

## دروستکردنی فۆڵدەر

```bash
mkdir projects
mkdir -p school/maths/homework
```

`mkdir` فۆڵدەرێک دروست دەکات. هەڵبژاردەی `-p` هەموو فۆڵدەرەکانی ناو ڕێڕەوەکە بە یەکجار دروست دەکات، تەنانەت ئەگەر فۆڵدەرە باوانەکان هێشتا بوونیان نەبێت.

## دروستکردنی فایل

```bash
touch notes.txt
```

`touch` فایلێکی بەتاڵ دروست دەکات. بۆ ئەوەی دەستبەجێ دەقێک بخەیتە ناو فایلێکەوە، `echo` لەگەڵ `>` بەکاربهێنە:

```bash
echo "Buy milk" > shopping.txt
echo "Buy bread" >> shopping.txt
```

- `>` دەنووسێتە ناو فایلەکەوە و هەرچی پێشتر تێیدا بووە **جێگە دەگرێتەوە**.
- `>>` بۆ کۆتایی فایلەکە **زیاد دەکات**.

## خوێندنەوەی فایل

```bash
cat shopping.txt     # print the whole file
less /etc/services   # scroll through a long file (q to quit)
head -n 5 /etc/services   # just the first 5 lines
tail -n 5 /etc/services   # just the last 5 lines
```

## دەستکاریکردنی فایل بە nano

`nano` دەستکاریکەرێکی دەقی سادەیە کە لەناو تێرمیناڵدا کار دەکات:

```bash
nano notes.txt
```

هەرچییەکت دەوێت بینووسە، پاشان:

- **Ctrl + O**، پاشان **Enter**، بۆ پاشەکەوتکردن ("write Out")
- **Ctrl + X** بۆ دەرچوون

کورتەڕێکان لە خوارەوەی شاشەی nano دا لیست کراون. `^` واتە کلیلی Ctrl.

## کۆپیکردن، گواستنەوە و ناوگۆڕین

```bash
cp notes.txt notes-backup.txt      # copy a file
cp -r projects projects-copy       # copy a folder and everything in it
mv notes-backup.txt school/        # move a file into a folder
mv shopping.txt groceries.txt      # rename a file
```

هیچ فەرمانێکی جیای "ناوگۆڕین" نییە: ناوگۆڕین تەنها گواستنەوەی فایلێکە بۆ ناوێکی نوێ.

## سڕینەوە

```bash
rm groceries.txt          # delete a file
rmdir projects-copy       # delete an empty folder
rm -r projects-copy       # delete a folder and everything inside it
```

> **وریا بە:** تێرمیناڵ هیچ سەبەتەی خۆڵێکی (recycle bin) نییە. فایلە سڕاوەکان بۆ هەمیشە دەڕۆن. `-i` زیاد بکە (`rm -i`) و لینوکس پێش سڕینەوەی هەر فایلێک پرسیارت لێ دەکات. هەمیشە پێش داگرتنی Enter، فەرمانەکانی `rm -r` دووبارە بپشکنە.

## Wildcard

نیشانەی `*` لەگەڵ هەر پیتێکدا دەگونجێت، بۆیە دەتوانیت لە یەک کاتدا لەگەڵ زۆر فایلدا کار بکەیت:

```bash
ls *.txt          # every file ending in .txt
cp *.jpg photos/  # copy every .jpg into photos
```

سەرەتا `ls` لەگەڵ wildcard ـێکدا جێبەجێ بکە تا ببینیت لەگەڵ کام فایلانەدا دەگونجێت، *پێش ئەوەی* لەگەڵ `rm` بەکاری بهێنیت.

## ڕاهێنان

تەنها بە تێرمیناڵ ئەم ڕێکخستنە دروست بکە، پاشان بە `ls -R school` بیپشکنە:

```text
school/
├── maths/
│   └── homework.txt   (containing the word "fractions")
└── science/
    └── lab-notes.txt  (write two lines in nano)
```

:::quiz
Q: جیاوازیی نێوان `>` و `>>` چییە؟
- [ ] هیچ جیاوازییەک نییە
- [x] `>` ناوەڕۆکی فایلەکە جێگە دەگرێتەوە؛ `>>` بۆ کۆتاییەکەی زیاد دەکات
- [ ] `>` فۆڵدەر دروست دەکات؛ `>>` فایل دروست دەکات
Why: یەک `>` فایلەکە لەسەر دەنووسێتەوە. کاتێک دەتەوێت ئەوەی پێشتر تێیدایە بمێنێتەوە، `>>` بەکاربهێنە.

Q: چۆن ناوی `draft.txt` دەگۆڕیت بۆ `essay.txt`؟
- [ ] `rename draft.txt essay.txt`
- [x] `mv draft.txt essay.txt`
- [ ] `cp draft.txt essay.txt`
Why: ناوگۆڕین گواستنەوەی فایلێکە بۆ ناوێکی نوێ، بۆیە `mv` بەکاردەهێنیت. `cp` دوو فایلت بۆ دەهێڵێتەوە.

Q: فایلێک بە `rm` دەسڕیتەوە. لە کوێوە دەتوانیت بیگەڕێنیتەوە؟
- [ ] سەبەتەی خۆڵ
- [ ] فۆڵدەری `~/deleted`
- [x] لە هیچ شوێنێک: بۆ هەمیشە سڕاوەتەوە
Why: `rm` سەبەتەی خۆڵ بەکارناهێنێت. ئەگەر دەتەوێت لینوکس پێش سڕینەوە پرسیارت لێ بکات، `rm -i` بەکاربهێنە.
:::
