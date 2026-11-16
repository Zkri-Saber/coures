# Course site for your students

A free course website you can host on GitHub Pages. Students get a course catalog with filters and sorting, lessons with videos, built-in quizzes, a progress tracker and a printable certificate. You manage everything by editing simple text files, right in your browser on github.com.

No servers, no database, no build step, no cost.

---

## Put it online (about 10 minutes)

### 1. Create a GitHub account

Go to [github.com](https://github.com) and sign up (free). Your username becomes part of your site address, so choose something short, like `mrsrivera` or `cs-class`.

### 2. Create a repository

1. Click the **+** in the top-right corner, then **New repository**.
2. **Repository name:** something like `courses` (this also becomes part of the address).
3. Choose **Public**. GitHub Pages is free for public repositories.
4. Click **Create repository**.

### 3. Upload the files

1. Unzip `course-site.zip` on your computer.
2. On your new repository page, click **uploading an existing file**.
3. Open the unzipped folder, select **everything inside it** (`index.html`, `assets`, `content`, `README.md`, `.nojekyll`) and drag it into the browser window.
   - `.nojekyll` is hidden on most computers. On Mac press `Cmd + Shift + .` in Finder to show it; on Windows enable *View → Hidden items*. It's optional, but it makes publishing faster.
4. Click **Commit changes**.

> Drag the *contents* of the folder, not the folder itself. `index.html` must be at the top level of the repository.

### 4. Turn on GitHub Pages

1. In the repository, open **Settings** → **Pages** (left menu).
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Choose branch **main** and folder **/ (root)**, then click **Save**.
4. Wait 1–2 minutes and refresh the page. A box appears with your site's address:

```
https://YOUR-USERNAME.github.io/courses/
```

Share that link with your students. Done.

---

## Make it yours

All your content lives in the `content` folder:

```
content/
  courses.json              ← site name, list of courses, modules and lessons (English)
  translations/
    ckb.json                ← Kurdish Sorani: labels, site name and every course's text
  web-basics/               ← one folder per course (folder name = course id)
    how-the-web-works.md    ← one file per lesson (file name = lesson id)
    how-the-web-works.ckb.md  ← the same lesson in Kurdish Sorani
    ...
  python-basics/
    ...
```

You can edit any file directly on github.com: open it, click the **pencil icon**, make your change, then click **Commit changes**. The site updates within a minute or two.

### Change the site name and teacher

At the top of `content/courses.json`:

```json
"site": {
  "title": "Grade 10 Computer Science",
  "tagline": "Lessons, videos and quizzes for our class.",
  "teacher": "Zkri Saber",
  "lang": "en",
  "dir": "ltr",
  "languages": [
    { "code": "ckb", "name": "کوردی", "dir": "rtl" },
    { "code": "en", "name": "English", "dir": "ltr" }
  ],
  "defaultLanguage": "ckb",
  "requireQuiz": false
}
```

| Setting | What it does |
| --- | --- |
| `title` | Big heading on the home page, and the browser tab name |
| `tagline` | The sentence under the title |
| `teacher` | Shown on course pages and certificates |
| `lang` | Language that `courses.json` itself is written in (`en`) |
| `dir` | `ltr` (left-to-right) or `rtl` for Arabic, Kurdish, Persian or Hebrew |
| `languages` | The languages students can switch between (see *Languages* below) |
| `defaultLanguage` | The language the site opens in the first time (`ckb` = Kurdish Sorani) |
| `requireQuiz` | `true` = students must answer every quiz question correctly before finishing a lesson |
| `footer` | Optional custom footer text |
| `text` | Optional: change the wording of any English button or label |

### The course catalog

The home page lists every course as a card, with a filter panel (Subject, Type, Skill, Level and Duration) and a **Sort by** menu. The filters are built automatically from each course's fields, so a new subject or level shows up as soon as you use it. Duration is worked out from the lesson minutes. A search box appears above the filters once you have more than six courses.

### Add a course

1. In `courses.json`, copy an existing course block (from `{` to the matching `}`), paste it after the last course, and put a **comma** between the two courses.
2. Give it a new `id`: lowercase letters, numbers and dashes only, like `algebra-1`.
3. Create a folder with the same name inside `content` (on GitHub: **Add file → Create new file**, then type `algebra-1/first-lesson.md` as the file name; typing the `/` creates the folder).

Course fields:

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | Used in the address and as the folder name |
| `title` | yes | |
| `summary` | | One or two sentences for the course list |
| `description` | | Longer intro on the course page (falls back to `summary`) |
| `subject` | | Groups courses in the **Subject** filter, e.g. `Programming` |
| `type` | | Label on the card and in the **Type** filter, e.g. `Course`, `Program`, `Workshop` (default `Course`) |
| `level` | | e.g. `Beginner`, `Intermediate`, `Advanced`. Shown on the card and in the **Level** filter |
| `tags` | | List of skills, e.g. `["Python", "Loops"]`. They appear as **Skills you'll learn** on the course page and make up the **Skill** filter |
| `color` | | The course's accent color (card badge and progress lines), e.g. `"#2563EB"`. Pick a darker shade so it shows up well |
| `cover` | | Style of the generated card picture: `web`, `code`, `server`, `branches`, `terminal`, `document` or `chart`. Leave it out and the site picks one from the tags |
| `image` | | Your own card picture instead, e.g. `"algebra-1/cover.jpg"` (a file in the course folder, roughly 2:1 wide) |
| `hours` | | Overrides the total time added up from lesson minutes |
| `outcomes` | | List of "What you'll learn" points |
| `prerequisites` | | List of what students should know first. Links work, e.g. `"Python basics (see [Python from zero](#/course/python-basics))"` |
| `project` | | A final project without its own page: `title`, `description`, `url` (e.g. a Google Form) and `button` text. For a full project page, use a project lesson instead (see *Add a project*) |
| `teacher` | | Overrides the site teacher for this course |
| `requireQuiz` | | Overrides the site setting for this course |
| `draft` | | `true` hides the course from the home page while you work on it (it's still reachable by direct link) |
| `modules` | yes | Groups of lessons |

### Add a lesson

1. Add a line to a module's `lessons` list:
   ```json
   { "id": "fractions", "title": "Working with fractions", "minutes": 15, "video": "",
     "summary": "Add, subtract and compare fractions with different denominators." }
   ```
2. Create `content/<course-id>/fractions.md` and write the lesson in Markdown.

The `summary` is the short description shown next to the lesson in the **Course Outline** on the course page. Lessons are numbered L1, L2, L3... automatically.

### Add a project

A project is a lesson page with instructions for something students make and hand in. Give it `"type": "project"` and, optionally, a link to your submission form:

```json
{ "id": "project-portfolio", "title": "Project: Build your portfolio", "type": "project",
  "minutes": 60, "summary": "Create and submit a one-page portfolio.",
  "submitUrl": "https://forms.gle/your-form" }
```

Projects get an orange **P** badge in the Course Outline, are counted separately from lessons, and show a **Submit your project** button at the end of the page. If `submitUrl` is empty, students see "Your teacher will tell you how to submit this project." A Google Form or Microsoft Form with a file-upload question works well for collecting work.

The simpler course-level `project` field (a title, description and link, with no page of its own) still works too and appears as the last row of the outline.

### Add a video

Paste a link into the lesson's `video` field. These all work:

```json
"video": "https://www.youtube.com/watch?v=VIDEO_ID"
"video": "https://youtu.be/VIDEO_ID"
"video": "https://vimeo.com/123456789"
"video": "web-basics/intro.mp4"
```

A file path like the last one means a video file you uploaded into the `content` folder. Keep uploaded videos small (GitHub rejects files over 100 MB); YouTube "Unlisted" videos are usually the better option.

### Writing lessons in Markdown

```markdown
## A section heading

Normal paragraph with **bold**, *italic* and `code`.

- Bullet point
- Another one

1. Numbered step
2. Next step

[A link](https://example.com)

![Description of the picture](diagram.png)

> A highlighted tip or note.
```

Images and files (PDF worksheets, for example) go in the same folder as the lesson, and you link to them by file name: `![Diagram](diagram.png)` or `[Download the worksheet](worksheet.pdf)`.

For code examples, put three backticks before and after, with the language name:

````markdown
```python
print("Hello!")
```
````

### Adding a quiz

Anywhere in a lesson file:

```markdown
:::quiz
Q: What is 3 × 4?
- [ ] 7
- [x] 12
- [ ] 34
Why: Multiplying 3 by 4 means adding four threes together.

Q: Next question...
- [x] Correct answer
- [ ] Wrong answer
:::
```

- `Q:` starts a question.
- `- [x]` marks the right answer, `- [ ]` the wrong ones.
- `Why:` is optional and appears after the student gets it right.
- Students can retry until they get it right. Their answers are saved.

### Languages: Kurdish Sorani and English

The site opens in **Kurdish Sorani**, right to left. The **English / کوردی** switch at the top of every page changes the language, and the site remembers each student's choice.

Each language has two parts:

1. **Labels and course information** (buttons, course titles, descriptions, module and lesson names) live in `content/translations/ckb.json`. It mirrors `courses.json`: the same course `id`s and lesson `id`s, with the text in Kurdish. Anything left out falls back to English.
2. **Lesson text** lives next to each English lesson, with `.ckb` before `.md`: `variables.md` is English, `variables.ckb.md` is Kurdish Sorani.

**When you edit a lesson,** change both files, or the two languages will drift apart. If a `.ckb.md` file is missing, Kurdish readers see the English lesson with a short note saying it hasn't been translated yet, so a new lesson never breaks the site.

**Code stays in English** in both versions, because that's how programmers write it. Keep the quiz markers (`:::quiz`, `Q:`, `- [x]`, `- [ ]`, `Why:`) exactly as they are, and translate only the words after them.

**The teacher's name** is kept in Latin letters (`Zkri Saber`) in both languages. To show it in Kurdish letters, change `"teacher"` inside `"site"` in `ckb.json`.

**To add another language** (for example Arabic, `ar`):

1. Add it to `languages` in `courses.json`: `{ "code": "ar", "name": "العربية", "dir": "rtl" }`.
2. Copy `content/translations/ckb.json` to `content/translations/ar.json` and translate the text (keep every key and `id` as it is).
3. Add `.ar.md` copies of the lessons you've translated.

**To use one language only,** remove the other from `languages` (the switch disappears when only one is left). To open in English by default, set `"defaultLanguage": "en"`.

The Kurdish translation was written carefully, but a native speaker should read it through before you rely on it, especially the technical terms.

---

## Preview on your own computer (optional)

Browsers won't load the course files if you just double-click `index.html`. Run a tiny local server instead. In a terminal, inside the site folder:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. (On Windows, use `python` instead of `python3`.) VS Code users can also use the **Live Server** extension.

## If something goes wrong

The site checks `courses.json` when it loads and shows a message explaining any problem, such as a missing comma, a missing `id`, or a lesson file that doesn't exist. The usual culprits:

- **A missing or extra comma** in `courses.json`. Paste the file into [jsonlint.com](https://jsonlint.com) to find it.
- **A lesson file name that doesn't match** its `id` (they must match exactly, including lowercase).
- **Changes not showing yet:** GitHub Pages takes a minute or two. Then refresh with `Ctrl + Shift + R` (`Cmd + Shift + R` on Mac).

---

## Things to know

- **Progress is stored in each student's browser.** If a student switches devices or clears their browsing data, their progress starts over. You (the teacher) can't see it. For assignments you need to grade, use the course `project.url` with a Google Form or Microsoft Form.
- **Everything is public.** Anyone with the link can see the site and the repository. Don't put student names, grades or other private information in it.
- **Certificates are for motivation,** not official records: students type their own name.
- **GitHub Pages limits:** sites can be up to 1 GB with a soft limit of 100 GB of traffic a month, far more than a class needs. It's meant for non-commercial sites, so don't sell courses on it.

## Want logins and a teacher dashboard?

That needs a backend (a server and database). Free-tier services like Supabase or Firebase can add student accounts and synced progress to this site while keeping it on GitHub Pages. It's a bigger step; start with this version and upgrade if you need it.

## Files

```
index.html          the single page that runs the site
assets/app.js       the app (routing, progress, quizzes, certificates)
assets/styles.css   all styling: colors and fonts are at the top
assets/fonts/       Inter and Noto Sans Arabic for Kurdish letters (SIL Open Font License)
assets/vendor/      marked, the Markdown converter (MIT License)
content/            your courses; content/translations/ holds the Kurdish Sorani text
.nojekyll           tells GitHub Pages to publish the files as they are
```
