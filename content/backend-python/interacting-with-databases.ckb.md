پێش بەکارهێنانی ORM، پێویستە تێبگەیت چی بۆت دەکات. لەم وانەیەدا ڕاستەوخۆ قسە لەگەڵ PostgreSQL دەکەیت: سەرەتا لە تێرمیناڵی تایبەت بە خۆیدا، پاشان لە پایتۆنەوە.

## مۆدێلی ڕاژەخواز-ڕاژەکار

ڕاژەکارێکی بنکەدراوەی وەک PostgreSQL وەک بەرنامەیەکی جیا کار دەکات، زۆرجار لەسەر ئامێرێکی تر. هەر شتێک پەیوەندی پێوە بکات **ڕاژەخواز** (client) ـە: تێرمیناڵی `psql`، ئامرازێکی گرافیکی، یان بەرنامە Flask ـەکەت.

```text
 client (psql, your app)  ──query──▶  PostgreSQL server  ──▶  data on disk
                          ◀─results──
```

چەندین ڕاژەخواز دەتوانن لە یەک کاتدا پەیوەندی بکەن، و ڕاژەکارەکە داتاکان بۆ هەموویان یەکگرتوو دەهێڵێتەوە.

## بنکەدراوە پەیوەندیدارەکان لە یەک خولەکدا

- داتاکان لە **خشتەکان** (table) دا دەژین، کە لە **ڕیز** (row، تۆمار) و **ستوون** (column، خانە) پێکهاتوون.
- هەر خشتەیەک **کلیلی سەرەکیی** (primary key) هەیە: ستوونێک کە هەموو ڕیزێک بە شێوەیەکی ناوازە دەناسێنێت، زۆرجار `id`.
- **کلیلی بیانی** (foreign key) ستوونێکە کە ئاماژە بە کلیلی سەرەکی لە خشتەیەکی تردا دەکات. خشتەکان بەم شێوەیە بە یەکەوە دەبەسترێن.

```text
todolists                     todos
+----+----------+             +----+-----------------+-----------+---------+
| id | name     |             | id | description     | completed | list_id |
+----+----------+             +----+-----------------+-----------+---------+
| 1  | Homework | ◀─────────  | 1  | Read chapter 3  | false     | 1       |
| 2  | Shopping |             | 2  | Buy milk        | true      | 2       |
+----+----------+             +----+-----------------+-----------+---------+
```

## پێداچوونەوە بە SQL دا

`psql` بکەرەوە، پەیوەندی بە بنکەدراوەکەتەوە بکە (`\c todoapp`)، و ئەمانە تاقی بکەرەوە:

```sql
CREATE TABLE todos (
    id SERIAL PRIMARY KEY,
    description VARCHAR(200) NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false
);

INSERT INTO todos (description) VALUES ('Read chapter 3'), ('Buy milk');

SELECT * FROM todos WHERE completed = false ORDER BY id;

UPDATE todos SET completed = true WHERE id = 2;

DELETE FROM todos WHERE id = 1;
```

فەرمانە بەسوودەکانی `psql` (بە هێڵی لاری پێچەوانە دەست پێ دەکەن و پێویستیان بە خاڵبۆر نییە):

| فەرمان | چی دەکات |
| --- | --- |
| `\l` | لیستکردنی بنکەدراوەکان |
| `\c todoapp` | پەیوەندیکردن بە بنکەدراوەیەکەوە |
| `\dt` | لیستکردنی خشتەکان |
| `\d todos` | وەسفکردنی ستوونەکانی خشتەیەک |
| `\q` | دەرچوون |

## قسەکردن لەگەڵ PostgreSQL لە پایتۆنەوە

بەرنامەکانی پایتۆن لە ڕێگەی **درایڤەرێکی DBAPI** ـەوە قسە لەگەڵ بنکەدراوەکان دەکەن، کتێبخانەیەک کە ڕووکاری ستانداردی بنکەدراوەی پایتۆن پەیڕەو دەکات. بۆ PostgreSQL، درایڤەرە نوێیەکە **psycopg** ـە (وەشانی 3). هەروەها خوشکە کۆنەکەی، `psycopg2`، لە زۆرێک لە فێرکارییەکاندا دەبینیت؛ نزیکەی بە هەمان شێوە کار دەکەن.

```python
import psycopg

with psycopg.connect("host=localhost dbname=todoapp user=postgres password=postgres") as conn:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO todos (description) VALUES (%s)",
            ("Practice SQL",),
        )
        cur.execute("SELECT id, description, completed FROM todos ORDER BY id")
        for row in cur.fetchall():
            print(row)
# Leaving the "with conn" block commits the transaction (or rolls it back on an error)
```

- **پەیوەندی** (connection) دانیشتنەکەتە لەگەڵ ڕاژەکارەکە.
- **کێرسەر** (cursor) پرسیارەکان دەنێرێت و ئەنجامەکان دەخوێنێتەوە.
- **مامەڵە** (transaction) گۆڕانکارییەکان کۆ دەکاتەوە تا پێکەوە بە commit پاشەکەوت بکرێن، یان پێکەوە بە rollback هەڵبوەشێنرێنەوە.

## هەرگیز SQL بە ڕێکخستنی دەق دروست مەکە

هەمیشە بەهاکان وەک **پارامیتەر** بنێرە (شوێنگرەوەکانی `%s` لەگەڵ tuple ـێکی بەهاکان). هەرگیز ئەمە مەکە:

```python
# DANGEROUS: never do this
cur.execute(f"SELECT * FROM users WHERE name = '{name}'")
```

ئەگەر `name` بریتی بێت لە `x' OR '1'='1`، پرسیارەکە هەموو بەکارهێنەرێک دەگەڕێنێتەوە. ئەم هێرشە پێی دەوترێت **SQL injection**، و یەکێکە لە باوترین کونە ئەمنییەکانی وێب. بە پارامیتەر، درایڤەرەکە بەهاکان جیا لە SQL دەنێرێت، بۆیە هەرگیز ناتوانن مانای پرسیارەکە بگۆڕن.

:::quiz
Q: کلیلی بیانی (foreign key) چییە؟
- [ ] کلیلێک کە بنکەدراوەیەک لە وڵاتێکی ترەوە دەکاتەوە
- [x] ستوونێک کە ئاماژە بە کلیلی سەرەکیی خشتەیەکی تر دەکات
- [ ] ستوونێکی وشەی نهێنیی شێوەگۆڕکراو
Why: کلیلە بیانییەکان ڕیزەکان لە نێوان خشتەکاندا دەبەستنەوە، بۆ نموونە `list_id` ـی هەر کارێک ئاماژە بە ڕیزێک لە `todolists` دەکات.

Q: کام دێڕ پرسیارێک بە سەلامەتی جێبەجێ دەکات؟
- [ ] `cur.execute(f"SELECT * FROM todos WHERE id = {todo_id}")`
- [ ] `cur.execute("SELECT * FROM todos WHERE id = " + todo_id)`
- [x] `cur.execute("SELECT * FROM todos WHERE id = %s", (todo_id,))`
Why: ناردنی بەهاکان وەک پارامیتەر ڕێگری لە SQL injection دەکات، چونکە درایڤەرەکە هەرگیز داتا تێکەڵی دەقی SQL ناکات.

Q: commit کردنی مامەڵەیەک چی دەکات؟
- [x] هەموو گۆڕانکارییەکانی ناو مامەڵەکە بۆ هەمیشە پاشەکەوت دەکات
- [ ] ڕاژەکاری بنکەدراوەکە دادەخات
- [ ] هەموو گۆڕانکارییەکان لە دوا پرسیارەوە هەڵدەوەشێنێتەوە
Why: Commit گۆڕانکارییەکان هەمیشەیی دەکات. Rollback پێچەوانەکەیەتی: هەڵیان دەوەشێنێتەوە.
:::
