نووسینی SQL ـی خاو بۆ هەموو پرسیارێک دووبارە دەبێتەوە، و دوو زمان لە کۆدەکەتدا تێکەڵ دەکات. **SQLAlchemy** بەناوبانگترین ئامرازی بنکەدراوەی پایتۆنە. **ORM** ـەکەی (Object-Relational Mapper) ڕێگەت پێ دەدات وەک ئۆبجێکتی ئاساییی پایتۆن کار لەگەڵ ڕیزەکاندا بکەیت.

## ORM چی دەکات

| بنکەدراوە | پایتۆن لەگەڵ ORM |
| --- | --- |
| خشتەیەک، `todos` | کلاسێک (class)، `Todo` |
| ڕیزێک | ئۆبجێکتێک، `Todo(description="Buy milk")` |
| ستوونێک | تایبەتمەندییەک، `todo.description` |
| `INSERT`، `UPDATE`، `DELETE` | زیادکردن، گۆڕین و سڕینەوەی ئۆبجێکتەکان، پاشان commit |

SQLAlchemy دوو چینی هەیە:

- **Core**: SQL لە پایتۆنەوە دروست دەکات و پەیوەندییەکان (**engine**) بەڕێوە دەبات لەسەر درایڤەرێکی DBAPI وەک psycopg.
- **ORM**: کلاسەکان بە خشتەکانەوە دەبەستێتەوە و گۆڕانکارییەکانی ئۆبجێکتەکانت لە **session** ـێکدا بەدوا دەکەوێت.

**Flask-SQLAlchemy** پێوەکراوێکی بچووکە کە SQLAlchemy بە Flask ـەوە دەبەستێتەوە: engine لە ڕێکخستنی بەرنامەکەتەوە دروست دەکات و session ـێکت دەداتێ کە دوای هەموو داواکارییەک پاک دەکرێتەوە.

## Flask بە PostgreSQL ـەوە ببەستەوە

لە فۆڵدەری `todoapp` ـدا `app.py` دروست بکە:

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from sqlalchemy import String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql+psycopg://postgres:postgres@localhost:5432/todoapp"

db = SQLAlchemy(app, model_class=Base)
migrate = Migrate(app, db)  # you'll use this in the Migrations lesson
```

**URI ـی بنکەدراوە** ئەم شێوەیەی هەیە:

```text
postgresql+psycopg://USER:PASSWORD@HOST:PORT/DATABASE
└──dialect──┘└driver┘
```

> لە پڕۆژە ڕاستەقینەکاندا، وشەی نهێنی ڕاستەوخۆ لەناو کۆددا مەنووسە. URI ـەکە لە گۆڕاوێکی ژینگەوە بخوێنەوە، بۆ نموونە `os.environ["DATABASE_URL"]`. لە بەشی 4 دا زیاتر فێر دەبیت.

## مۆدێلێک پێناسە بکە

**مۆدێل** (model) کلاسێکە کە خشتەیەک وەسف دەکات:

```python
class Todo(db.Model):
    __tablename__ = "todos"

    id: Mapped[int] = mapped_column(primary_key=True)
    description: Mapped[str] = mapped_column(String(200))
    completed: Mapped[bool] = mapped_column(default=False)

    def __repr__(self):
        return f"<Todo {self.id}: {self.description}>"
```

- `Mapped[int]` جۆری پایتۆن بە SQLAlchemy دەڵێت، و لەویشەوە جۆری ستوونەکە.
- ستوونەکان بە شێوەی بنەڕەتی **پێویستن** (`NOT NULL`). بۆ ستوونی دڵخواز `Mapped[str | None]` بەکاربهێنە.
- `primary_key=True`، `id` دەکات بە کلیلێکی سەرەکیی خۆ-زیادبوو.
- `__repr__` وا دەکات ئۆبجێکتەکان بە جوانی پیشان بدرێن کاتێک تاقیکاری دەکەیت.

## خشتەکە دروست بکە

بۆ تاقیکردنەوەیەکی خێرا دەتوانیت خشتەکان ڕاستەوخۆ لە مۆدێلەکانتەوە دروست بکەیت. Flask shell بکەرەوە:

```bash
flask --app app shell
```

```python
>>> db.create_all()
```

`db.create_all()` تەنها ئەو خشتانە دروست دەکات کە هێشتا بوونیان نییە. **هەرگیز** خشتە هەبووەکان **ناگۆڕێت**، بۆیە کاتێک بەرنامەکەت داتای ڕاستەقینەی هەبوو، لە جیاتی ئەوە **مایگرەیشن** بەکاردەهێنیت (دوو وانەی تر).

## زیادکردن و خوێندنەوەی داتا

هێشتا لە shell دا:

```python
>>> todo = Todo(description="Read chapter 3")
>>> db.session.add(todo)
>>> db.session.commit()
>>> todo.id
1
>>> db.session.execute(db.select(Todo)).scalars().all()
[<Todo 1: Read chapter 3>]
```

بپشکنە کە بەڕاستی گەیشتووەتە بنکەدراوەکە. لە `psql` دا، `SELECT * FROM todos;` جێبەجێ بکە و ڕیزەکەت لەوێیە.

:::quiz
Q: لە ORM دا، کلاسێکی مۆدێل زۆرجار نوێنەرایەتیی چی دەکات؟
- [ ] یەک ڕیز
- [x] خشتەیەکی بنکەدراوە
- [ ] ڕاژەکارێکی بنکەدراوە
Why: کلاسەکە بە خشتەیەکەوە دەبەسترێتەوە، و هەر نموونەیەکی (instance) کلاسەکە بە ڕیزێکەوە.

Q: خشتەکەت پێشتر داتای تێدایە و ستوونێکی نوێ بۆ مۆدێلەکە زیاد دەکەیت. `db.create_all()` چی دەکات؟
- [ ] ستوونە نوێیەکە بۆ خشتە هەبووەکە زیاد دەکات
- [x] هیچ شتێک بەو خشتەیە ناکات، چونکە تەنها ئەو خشتانە دروست دەکات کە بوونیان نییە
- [ ] خشتەکە دەسڕێتەوە و دووبارە دروستی دەکاتەوە
Why: `create_all()` هەرگیز خشتە هەبووەکان ناگۆڕێت. گۆڕانکاری لە ڕێکخستندا پێویستی بە مایگرەیشن هەیە.

Q: کام بەشی `postgresql+psycopg://postgres:secret@localhost:5432/todoapp` ناوی بنکەدراوەکەیە؟
- [ ] `postgresql`
- [ ] `localhost`
- [x] `todoapp`
Why: ناوی بنکەدراوە لە کۆتاییدا دێت، دوای host و پۆرت.
:::
