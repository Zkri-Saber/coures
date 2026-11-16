ئێستا کە دەتوانیت مۆدێل پێناسە بکەیت، با دوو شت کە بەردەوام دەیانکەیت بە تەواوی فێر ببین: **پرسیارکردن** (querying) لە داتا و **گۆڕینی**. ئەم نموونانە لە `flask --app app shell` دا جێبەجێ بکە دوای زیادکردنی چەند کارێک.

## هەڵبژاردنی داتا

پرسیارەکان بە `db.select()` دروست دەکرێن و بە `db.session.execute()` جێبەجێ دەکرێن. `.scalars()` بەکاربهێنە بۆ گەڕاندنەوەی ئۆبجێکتی مۆدێل.

```python
# All to-dos, in order
todos = db.session.execute(db.select(Todo).order_by(Todo.id)).scalars().all()

# Filter by exact values
open_todos = db.session.execute(
    db.select(Todo).filter_by(completed=False)
).scalars().all()

# Filter with expressions: comparisons, LIKE, and more
milk = db.session.execute(
    db.select(Todo).where(Todo.description.ilike("%milk%"))
).scalars().all()

# Newest two
latest = db.session.execute(
    db.select(Todo).order_by(Todo.id.desc()).limit(2)
).scalars().all()

# Just the first match, or None
first = db.session.execute(db.select(Todo).filter_by(completed=True)).scalars().first()
```

هەندێک کورتەڕێی بەسوود:

| دەتەوێت | کۆد |
| --- | --- |
| یەک ڕیز بە کلیلی سەرەکی (یان `None`) | `db.session.get(Todo, 2)` |
| یەک ڕیز بە کلیلی سەرەکی، یان پەڕەی 404 لە view ـێکدا | `db.get_or_404(Todo, 2)` |
| ژماردنی ڕیزەکان | `db.session.execute(db.select(func.count()).select_from(Todo)).scalar()` |
| گەڕان بەبێ جیاوازی پیتی گەورە و بچووک | `.where(Todo.description.ilike("%term%"))` |
| چەند مەرجێک | `.where(Todo.completed == False, Todo.priority > 1)` |

(`func` لە `from sqlalchemy import func` ـەوە دێت.)

### هەروەها `Model.query` دەبینیت

فێرکارییە کۆنەکان شێوازێکی جیاواز بەکاردەهێنن:

```python
Todo.query.filter_by(completed=True).all()
Todo.query.get(2)
```

ئەم **ڕووکاری پرسیاری کۆنە** (legacy query interface) هێشتا کار دەکات، بەڵام SQLAlchemy و Flask-SQLAlchemy ئێستا `db.session.execute(db.select(...))` پێشنیار دەکەن، کە ئەوەیە ئێمە بەکاری دەهێنین. شێوازە کۆنەکە بناسەرەوە، بەڵام نوێیەکە بنووسە.

## گۆڕینی داتا

```python
# Update: change the attribute, then commit
todo = db.session.get(Todo, 2)
todo.completed = True
db.session.commit()

# Delete
db.session.delete(todo)
db.session.commit()
```

هەرگیز خۆت `UPDATE` یان `DELETE` نانووسیت. session ـەکە تێبینی دەکات چی گۆڕاوە و کاتێک commit دەکەیت SQL ـەکە دروست دەکات.

## Session و سووڕی ژیانی ئۆبجێکت

**session** شوێنی کارێکە کە ئەو ئۆبجێکتانە بەدوا دەکەوێت کە کاریان لەگەڵ دەکەیت. گۆڕانکارییەکان لە یەک **مامەڵە** (transaction) دا لە بنکەدراوەکەدا پاشەکەوت دەکات کاتێک `commit()` بانگ دەکەیت، یان بە `rollback()` فڕێیان دەدات.

ئۆبجێکتێک بەم دۆخانەدا تێدەپەڕێت:

| دۆخ | مانا | چۆن دەگاتە ئەوێ |
| --- | --- | --- |
| **Transient** (تێپەڕ) | ئۆبجێکتێکی پایتۆن کە بنکەدراوە نایناسێت | `todo = Todo(description="Water plants")` |
| **Pending** (چاوەڕوان) | بۆ session زیاد کراوە بەڵام هێشتا لە بنکەدراوەدا نەنووسراوە | `db.session.add(todo)` |
| **Persistent** (بەردەوام) | لە بنکەدراوەدا هەڵگیراوە و session بەدوای دەکەوێت | دوای `db.session.flush()` یان `commit()` |
| **Detached** (جیابووەوە) | لە بنکەدراوەدا بووە، بەڵام چیتر هیچ session ـێک بەدوای ناکەوێت | دوای داخستنی session، بۆ نموونە لە کۆتایی داواکارییەکدا |

بە `sqlalchemy.inspect` تاقی بکەرەوە:

```python
>>> from sqlalchemy import inspect
>>> todo = Todo(description="Water plants")
>>> inspect(todo).transient
True
>>> db.session.add(todo)
>>> inspect(todo).pending, todo.id
(True, None)
>>> db.session.flush()          # sends the INSERT, but doesn't commit yet
>>> todo.id
4
>>> db.session.commit()
>>> inspect(todo).persistent
True
```

`flush()` SQL ـی چاوەڕوان دەنێرێت بۆ بنکەدراوە لەناو مامەڵەی ئێستادا (بەم شێوەیە `todo.id` بەهایەک وەردەگرێت) بەبێ ئەوەی هەمیشەیی بکات. `commit()` هەم flush دەکات و هەم هەموو شتێک هەمیشەیی دەکات.

## هەمیشە شکستەکان چارەسەر بکە

ئەگەر commit ـێک شکستی هێنا، session ـەکە لە دۆخێکی تێکچوودا دەمێنێتەوە تا rollback دەکەیت. لە view ـەکاندا ئەم نموونەیە بەکاربهێنە:

```python
try:
    db.session.add(todo)
    db.session.commit()
except Exception:
    db.session.rollback()
    raise
```

:::quiz
Q: کام دێڕ هەموو ئەو کارانە دەهێنێت کە تەواو نەکراون؟
- [x] `db.session.execute(db.select(Todo).filter_by(completed=False)).scalars().all()`
- [ ] `db.session.get(Todo, completed=False)`
- [ ] `Todo.completed == False`
Why: `select` پرسیارەکە دروست دەکات، `filter_by` مەرجەکە زیاد دەکات، و `scalars().all()` ئۆبجێکتە گونجاوەکان دەگەڕێنێتەوە.

Q: `db.session.add(todo)` ـت بانگ کردووە بەڵام `commit()` نا. `todo` لە چ دۆخێکدایە؟
- [ ] Transient
- [x] Pending
- [ ] Detached
Why: زیادکراو بۆ session بەڵام هێشتا لە بنکەدراوەدا نەنووسراو، دۆخی pending ـە.

Q: `commit()` ـێک هەڵەی دا. پێش بەکارهێنانەوەی session چی دەکەیت؟
- [ ] دووبارە `commit()` بانگ دەکەیتەوە
- [x] `db.session.rollback()` بانگ دەکەیت
- [ ] PostgreSQL ڕیستارت دەکەیتەوە
Why: دوای commit ـێکی شکستخواردوو، session دەبێت rollback بکرێت تا بگەڕێتەوە دۆخێکی بەکارهاتوو.
:::
