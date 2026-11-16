/* ==========================================================================
   Course site: a small single-page app that runs on any static host
   (GitHub Pages, Netlify, a school server...). No build step.

   - Courses, modules and lessons are listed in content/courses.json
   - Each lesson's text is a Markdown file: content/<course-id>/<lesson-id>.md
   - Student progress is stored in the browser (localStorage)

   You normally don't need to edit this file. To translate the interface,
   add a "text" object to "site" in content/courses.json (see README.md).
   ========================================================================== */

(function () {
  "use strict";

  var CONTENT_DIR = "content/";
  var STORE_KEY = "course-site-progress-v1";
  var NAME_KEY = "course-site-student-name";

  /* Every piece of interface text. Override any of these from courses.json -> site.text */
  var TEXT = {
    allCourses: "All courses",
    loading: "Loading…",
    startCourse: "Start course",
    continueCourse: "Continue",
    reviewCourse: "Review course",
    level: "Level",
    lessons: "Lessons",
    time: "Time",
    teacher: "Teacher",
    lessonsCount: "{n} lessons",
    oneLesson: "1 lesson",
    minutesShort: "{n} min",
    aboutMinutes: "{n} minutes",
    aboutHour: "About 1 hour",
    aboutHours: "About {n} hours",
    overallNone: "{lessons} lessons across {courses} courses. Pick one to begin.",
    overallSome: "You've finished {done} of {total} lessons.",
    overallAll: "You've finished every lesson. Well done.",
    searchLabel: "Search courses",
    searchPlaceholder: "Search by title or topic",
    noMatches: "No courses match “{q}”. Try a shorter word.",
    noCourses: "There are no courses yet. Add one to content/courses.json.",
    lessonsDone: "of {total} lessons done",
    startFirst: "Start the first lesson",
    continueTo: "Continue: {title}",
    reviewFromStart: "Review from the start",
    syllabus: "Lessons",
    outcomes: "What you'll learn",
    project: "Final project",
    openProject: "Open the submission form",
    finishedTitle: "You finished this course",
    finishedText: "Every lesson is done. Your certificate is ready.",
    getCertificate: "Get your certificate",
    upNext: "Up next",
    done: "Done",
    lessonOf: "Lesson {i} of {n}",
    quizTitle: "Check your understanding",
    quizScore: "{right} of {total} correct",
    checkAnswer: "Check answer",
    correct: "Correct.",
    incorrect: "Not quite. Pick another answer and check again.",
    chooseFirst: "Choose an answer first.",
    statusNotDone: "Not finished yet",
    statusDone: "You finished this lesson",
    statusNeedQuiz: "Answer every quiz question correctly to finish this lesson.",
    finishContinue: "Finish lesson and continue",
    finishCourse: "Finish course",
    nextLesson: "Next lesson",
    backToCourse: "Back to course overview",
    markNotDone: "Mark as not finished",
    previous: "Previous: {title}",
    certTitle: "Your certificate",
    certIntro: "Type your name the way you want it printed, then print it or save it as a PDF.",
    certName: "Your name",
    certNamePlaceholder: "Your name",
    certPrint: "Print certificate",
    certTop: "Certificate of completion",
    certCompleted: "has completed the course",
    certDate: "Date",
    certTeacher: "Teacher",
    certLocked: "Finish all {n} lessons to unlock your certificate. You have {left} left.",
    notFound: "That page doesn't exist",
    notFoundHint: "The link may be out of date. Go back to all courses to find what you need.",
    lessonMissing: "This lesson's text couldn't be loaded",
    lessonMissingHint: "The site looked for {file}. Check that the file exists and that its name matches the lesson id in courses.json.",
    progressNote: "Your progress is saved in this browser only.",
    resetProgress: "Reset my progress",
    resetConfirm: "Click again to erase all progress"
  };

  var DATA = null;
  var SITE = {};
  var main = document.getElementById("main");
  var mdCache = {};
  var renderToken = 0;

  /* ---------------- helpers ---------------- */

  function t(key, vars) {
    var s = TEXT[key] != null ? String(TEXT[key]) : key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        s = s.split("{" + k + "}").join(vars[k]);
      });
    }
    return s;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function href() {
    return "#/" + Array.prototype.map.call(arguments, encodeURIComponent).join("/");
  }

  function inlineMd(s) {
    if (window.marked && marked.parseInline) return marked.parseInline(String(s || ""));
    return esc(s);
  }

  function setTitle(part) {
    var base = SITE.title || "Courses";
    document.title = part ? part + " | " + base : base;
  }

  function formatTime(minutes) {
    if (!minutes) return "";
    if (minutes < 55) return t("aboutMinutes", { n: Math.round(minutes / 5) * 5 || minutes });
    var hours = Math.round(minutes / 30) / 2;
    if (hours <= 1) return t("aboutHour");
    return t("aboutHours", { n: hours });
  }

  function lessonCountText(n) {
    return n === 1 ? t("oneLesson") : t("lessonsCount", { n: n });
  }

  /* ---------------- progress storage ---------------- */

  var progress = loadProgress();

  function loadProgress() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      var p = raw ? JSON.parse(raw) : {};
      return p && typeof p === "object" ? p : {};
    } catch (e) {
      return {};
    }
  }

  function saveProgress() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(progress)); } catch (e) { /* storage full or blocked */ }
  }

  function courseProgress(courseId) {
    if (!progress[courseId]) progress[courseId] = { done: {}, quiz: {} };
    var p = progress[courseId];
    if (!p.done) p.done = {};
    if (!p.quiz) p.quiz = {};
    return p;
  }

  function isDone(courseId, lessonId) {
    return !!(progress[courseId] && progress[courseId].done && progress[courseId].done[lessonId]);
  }

  function setDone(courseId, lessonId, value) {
    var p = courseProgress(courseId);
    if (value) p.done[lessonId] = new Date().toISOString();
    else delete p.done[lessonId];
    saveProgress();
  }

  function quizState(courseId, lessonId) {
    var p = courseProgress(courseId);
    if (!p.quiz[lessonId]) p.quiz[lessonId] = {};
    return p.quiz[lessonId];
  }

  function getName() {
    try { return localStorage.getItem(NAME_KEY) || ""; } catch (e) { return ""; }
  }
  function saveName(v) {
    try { localStorage.setItem(NAME_KEY, v); } catch (e) { /* ignore */ }
  }

  /* ---------------- course data helpers ---------------- */

  function visibleCourses() {
    return DATA.courses.filter(function (c) { return !c.draft; });
  }

  function findCourse(id) {
    for (var i = 0; i < DATA.courses.length; i++) if (DATA.courses[i].id === id) return DATA.courses[i];
    return null;
  }

  function flatLessons(course) {
    var out = [];
    course.modules.forEach(function (m, mi) {
      (m.lessons || []).forEach(function (l) {
        out.push({ lesson: l, module: m, moduleIndex: mi, index: out.length });
      });
    });
    return out;
  }

  function stats(course) {
    var list = flatLessons(course);
    var done = 0, next = null, minutes = 0, lastDoneAt = null;
    list.forEach(function (item) {
      minutes += Number(item.lesson.minutes) || 0;
      if (isDone(course.id, item.lesson.id)) {
        done++;
        var at = progress[course.id].done[item.lesson.id];
        if (typeof at === "string" && (!lastDoneAt || at > lastDoneAt)) lastDoneAt = at;
      } else if (!next) {
        next = item;
      }
    });
    if (course.hours) minutes = Number(course.hours) * 60;
    return {
      list: list,
      total: list.length,
      done: done,
      next: next,
      minutes: minutes,
      finished: list.length > 0 && done === list.length,
      lastDoneAt: lastDoneAt
    };
  }

  function lineStyle(course) {
    return course.color ? ' style="--line:' + esc(course.color) + '"' : "";
  }

  /* Horizontal route: one stop per lesson; the line fills up to the next stop */
  function routeH(course, s) {
    var nextIndex = s.next ? s.next.index : s.total - 1;
    var fill = s.total > 1 ? nextIndex / (s.total - 1) : (s.finished ? 1 : 0);
    if (s.finished) fill = 1;
    var stops = s.list.map(function (item) {
      var cls = "stop";
      if (isDone(course.id, item.lesson.id)) cls += " done";
      else if (s.next && s.next.index === item.index) cls += " next";
      return '<span class="' + cls + '" title="' + esc(item.lesson.title) + '"></span>';
    }).join("");
    return '<div class="route-h" aria-hidden="true" style="--progress:' + fill.toFixed(4) + '">' +
      '<span class="route-fill"></span>' + stops + "</div>";
  }

  /* Vertical route: modules and lessons */
  function routeV(course, s, currentLessonId) {
    var html = '<ul class="route-v">';
    course.modules.forEach(function (m) {
      html += '<li class="module"><div class="module-title">' + esc(m.title) +
        (m.summary ? '<span class="module-sub">' + esc(m.summary) + "</span>" : "") +
        "</div><ol>";
      (m.lessons || []).forEach(function (l) {
        var done = isDone(course.id, l.id);
        var isNext = !done && s.next && s.next.lesson.id === l.id;
        var cls = "station" + (done ? " done" : "") + (isNext ? " next" : "");
        var meta = done ? t("done") : isNext ? '<span class="tag-next">' + t("upNext") + "</span>" :
          (l.minutes ? t("minutesShort", { n: l.minutes }) : "");
        var current = l.id === currentLessonId ? ' aria-current="page"' : "";
        var srState = done ? '<span class="visually-hidden"> (' + t("done") + ")</span>" : "";
        html += '<li class="' + cls + '"' + current + '><a href="' + href("course", course.id, l.id) + '">' +
          '<span class="station-title">' + esc(l.title) + srState + "</span>" +
          '<span class="station-meta" aria-hidden="true">' + meta + "</span></a></li>";
      });
      html += "</ol></li>";
    });
    return html + "</ul>";
  }

  /* ---------------- views ---------------- */

  function renderHome() {
    setTitle("");
    var courses = visibleCourses();
    var totals = { lessons: 0, done: 0 };
    courses.forEach(function (c) {
      var s = stats(c);
      totals.lessons += s.total;
      totals.done += s.done;
    });

    var overall;
    if (totals.done === 0) overall = t("overallNone", { lessons: totals.lessons, courses: courses.length });
    else if (totals.done === totals.lessons) overall = t("overallAll");
    else overall = t("overallSome", { done: "<strong>" + totals.done + "</strong>", total: totals.lessons });

    var showSearch = courses.length > 5;

    main.innerHTML =
      '<div class="wrap">' +
        '<section class="home-hero">' +
          '<h1 tabindex="-1">' + esc(SITE.title || "Courses") + "</h1>" +
          (SITE.tagline ? '<p class="tagline">' + esc(SITE.tagline) + "</p>" : "") +
          (courses.length ? '<p class="overall">' + overall + "</p>" : "") +
        "</section>" +
        (showSearch ?
          '<div class="course-search"><label class="visually-hidden" for="q">' + t("searchLabel") + "</label>" +
          '<input id="q" type="search" autocomplete="off" placeholder="' + esc(t("searchPlaceholder")) + '"></div>' : "") +
        '<ul class="lines animate-routes" id="course-list"></ul>' +
        '<p class="empty-state" id="empty" hidden></p>' +
      "</div>";

    var list = document.getElementById("course-list");
    var empty = document.getElementById("empty");

    function draw(query) {
      var q = (query || "").trim().toLowerCase();
      var shown = courses.filter(function (c) {
        if (!q) return true;
        var hay = [c.title, c.summary, c.level, (c.tags || []).join(" ")].join(" ").toLowerCase();
        return hay.indexOf(q) !== -1;
      });
      list.innerHTML = shown.map(courseRow).join("");
      empty.hidden = shown.length > 0;
      if (!shown.length) empty.textContent = courses.length ? t("noMatches", { q: query }) : t("noCourses");
    }
    draw("");

    if (showSearch) {
      document.getElementById("q").addEventListener("input", function (e) {
        list.classList.remove("animate-routes");
        draw(e.target.value);
      });
    }
  }

  function courseRow(c) {
    var s = stats(c);
    var cta = s.finished ? t("reviewCourse") : s.done > 0 ? t("continueCourse") : t("startCourse");
    var meta = "";
    if (c.level) meta += "<div><dt>" + t("level") + "</dt><dd>" + esc(c.level) + "</dd></div>";
    meta += "<div><dt>" + t("lessons") + "</dt><dd>" + s.total + "</dd></div>";
    if (s.minutes) meta += "<div><dt>" + t("time") + "</dt><dd>" + formatTime(s.minutes) + "</dd></div>";
    return '<li class="line-row"' + lineStyle(c) + '><a href="' + href("course", c.id) + '">' +
      '<div class="line-head"><h2>' + esc(c.title) + "</h2>" +
      (c.summary ? "<p>" + esc(c.summary) + "</p>" : "") + "</div>" +
      routeH(c, s) +
      '<dl class="line-meta">' + meta + "</dl>" +
      '<span class="line-cta"><span class="btn' + (s.done > 0 ? "" : " btn-quiet") + '">' + cta + "</span></span>" +
      "</a></li>";
  }

  function renderCourse(course) {
    setTitle(course.title);
    var s = stats(course);
    var target = s.next || s.list[0];

    var buttonLabel = s.finished ? t("reviewFromStart") :
      s.done === 0 ? t("startFirst") : t("continueTo", { title: s.next.lesson.title });

    var facts = "";
    if (course.level) facts += "<div><dt>" + t("level") + "</dt><dd>" + esc(course.level) + "</dd></div>";
    facts += "<div><dt>" + t("lessons") + "</dt><dd>" + s.total + "</dd></div>";
    if (s.minutes) facts += "<div><dt>" + t("time") + "</dt><dd>" + formatTime(s.minutes) + "</dd></div>";
    var teacher = course.teacher || SITE.teacher;
    if (teacher) facts += "<div><dt>" + t("teacher") + "</dt><dd>" + esc(teacher) + "</dd></div>";

    var aside = "";
    if (s.finished) {
      aside += '<section class="aside-block finished"><h2>' + t("finishedTitle") + "</h2><p>" + t("finishedText") + "</p>" +
        '<a class="btn" href="' + href("course", course.id, "certificate") + '">' + t("getCertificate") + "</a></section>";
    }
    if (course.outcomes && course.outcomes.length) {
      aside += '<section class="aside-block"><h2>' + t("outcomes") + '</h2><ul class="outcomes">' +
        course.outcomes.map(function (o) { return "<li>" + inlineMd(o) + "</li>"; }).join("") + "</ul></section>";
    }
    if (course.project) {
      var p = course.project;
      aside += '<section class="aside-block"><h2>' + esc(p.title || t("project")) + "</h2>" +
        (p.description ? "<p>" + inlineMd(p.description) + "</p>" : "") +
        (p.url ? '<a class="btn btn-quiet" href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.button || t("openProject")) + "</a>" : "") +
        "</section>";
    }

    main.innerHTML =
      '<div class="wrap"' + lineStyle(course) + ">" +
        '<p class="crumbs"><a href="#/">' + t("allCourses") + "</a></p>" +
        '<section class="course-hero">' +
          "<div>" +
            '<h1 tabindex="-1">' + esc(course.title) + "</h1>" +
            (course.description || course.summary ? '<p class="summary">' + inlineMd(course.description || course.summary) + "</p>" : "") +
            '<dl class="course-facts">' + facts + "</dl>" +
          "</div>" +
          '<div class="progress-panel">' +
            '<p class="count"><strong>' + s.done + "</strong> " + t("lessonsDone", { total: s.total }) + "</p>" +
            routeH(course, s) +
            (target ? '<a class="btn" href="' + href("course", course.id, target.lesson.id) + '">' + esc(buttonLabel) + "</a>" : "") +
          "</div>" +
        "</section>" +
        '<div class="course-body">' +
          "<section><h2>" + t("syllabus") + "</h2>" + routeV(course, s, null) + "</section>" +
          '<aside class="course-aside">' + aside + "</aside>" +
        "</div>" +
      "</div>";
  }

  function lessonFile(course, lesson) {
    return CONTENT_DIR + (lesson.file || (course.id + "/" + lesson.id + ".md"));
  }

  function renderLesson(course, lessonId) {
    var s = stats(course);
    var item = null;
    s.list.forEach(function (x) { if (x.lesson.id === lessonId) item = x; });
    if (!item) return renderNotFound();

    var lesson = item.lesson;
    var prev = s.list[item.index - 1] || null;
    var next = s.list[item.index + 1] || null;
    setTitle(lesson.title);

    var wide = window.matchMedia("(min-width: 861px)").matches;

    main.innerHTML =
      '<div class="wrap"' + lineStyle(course) + ">" +
        '<div class="lesson-layout">' +
          '<details class="lesson-nav"' + (wide ? " open" : "") + ">" +
            '<summary><span class="nav-course">' + esc(course.title) + "</span>" +
              '<span class="nav-count">' + s.done + " " + t("lessonsDone", { total: s.total }) + "</span></summary>" +
            routeH(course, s) +
            routeV(course, s, lesson.id) +
            '<p><a class="prev-link" href="' + href("course", course.id) + '">' + t("backToCourse") + "</a></p>" +
          "</details>" +
          '<article class="lesson">' +
            '<header class="lesson-head">' +
              '<p class="where">' + esc(item.module.title) + "</p>" +
              '<h1 tabindex="-1">' + esc(lesson.title) + "</h1>" +
              '<p class="lesson-facts">' + t("lessonOf", { i: item.index + 1, n: s.total }) +
                (lesson.minutes ? "<span aria-hidden=\"true\">&ensp;/&ensp;</span>" + t("minutesShort", { n: lesson.minutes }) : "") + "</p>" +
            "</header>" +
            videoHtml(lesson) +
            '<div class="prose" id="lesson-body"><p class="loading" style="padding:0">' + t("loading") + "</p></div>" +
            '<div class="lesson-actions" id="lesson-actions"></div>' +
            (prev ? '<a class="prev-link" href="' + href("course", course.id, prev.lesson.id) + '">' + esc(t("previous", { title: prev.lesson.title })) + "</a>" : "") +
          "</article>" +
        "</div>" +
      "</div>";

    var token = ++renderToken;
    var quizzes = [];

    loadMarkdown(lessonFile(course, lesson)).then(function (md) {
      if (token !== renderToken) return;
      var body = document.getElementById("lesson-body");
      var parsed = extractQuizzes(md);
      quizzes = parsed.quizzes;
      body.innerHTML = window.marked ? marked.parse(parsed.markdown) : "<pre>" + esc(parsed.markdown) + "</pre>";
      fixRelativeLinks(body, course);
      body.querySelectorAll(".quiz-slot").forEach(function (slot) {
        var n = Number(slot.getAttribute("data-quiz"));
        slot.replaceWith(buildQuiz(course, lesson, quizzes[n], n, updateActions));
      });
      updateActions();
    }).catch(function () {
      if (token !== renderToken) return;
      document.getElementById("lesson-body").innerHTML =
        '<div class="notice"><h2>' + t("lessonMissing") + "</h2><p>" +
        t("lessonMissingHint", { file: "<code>" + esc(lessonFile(course, lesson)) + "</code>" }) + "</p></div>";
      updateActions();
    });

    function quizComplete() {
      var state = quizState(course.id, lesson.id);
      var ok = true;
      quizzes.forEach(function (qz, n) {
        qz.forEach(function (q, i) {
          var st = state[n + "-" + i];
          if (!st || !st.correct) ok = false;
        });
      });
      return ok;
    }

    function updateActions() {
      var box = document.getElementById("lesson-actions");
      if (!box) return;
      var done = isDone(course.id, lesson.id);
      var needsQuiz = (course.requireQuiz != null ? course.requireQuiz : SITE.requireQuiz) && !quizComplete();
      var status, buttons = "";
      if (done) {
        status = '<p class="status is-done">' + t("statusDone") + "</p>";
        buttons += '<button type="button" class="btn btn-quiet" data-act="undo">' + t("markNotDone") + "</button>";
        buttons += next ?
          '<a class="btn" href="' + href("course", course.id, next.lesson.id) + '">' + t("nextLesson") + ": " + esc(next.lesson.title) + "</a>" :
          '<a class="btn" href="' + href("course", course.id) + '">' + t("backToCourse") + "</a>";
      } else {
        status = '<p class="status">' + (needsQuiz ? t("statusNeedQuiz") : t("statusNotDone")) + "</p>";
        buttons += '<button type="button" class="btn" data-act="finish"' + (needsQuiz ? " disabled" : "") + ">" +
          (next ? t("finishContinue") : t("finishCourse")) + "</button>";
      }
      box.innerHTML = status + '<div class="buttons">' + buttons + "</div>";
      var finish = box.querySelector('[data-act="finish"]');
      if (finish) finish.addEventListener("click", function () {
        setDone(course.id, lesson.id, true);
        location.hash = next ? href("course", course.id, next.lesson.id) : href("course", course.id);
      });
      var undo = box.querySelector('[data-act="undo"]');
      if (undo) undo.addEventListener("click", function () {
        setDone(course.id, lesson.id, false);
        refreshNav();
        updateActions();
        var f = box.querySelector('[data-act="finish"]');
        if (f) f.focus();
      });
    }

    function refreshNav() {
      var nav = main.querySelector(".lesson-nav");
      if (!nav) return;
      var open = nav.open;
      var s2 = stats(course);
      nav.querySelector(".nav-count").textContent = s2.done + " " + t("lessonsDone", { total: s2.total });
      nav.querySelector(".route-h").outerHTML = routeH(course, s2);
      nav.querySelector(".route-v").outerHTML = routeV(course, s2, lesson.id);
      nav.open = open;
    }
  }

  function videoHtml(lesson) {
    var v = (lesson.video || lesson.youtube || "").trim();
    if (!v) return "";
    var title = esc(lesson.title);
    if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(v)) {
      var src = /^(https?:)?\/\//.test(v) ? v : CONTENT_DIR + v;
      return '<div class="video"><video controls preload="metadata" src="' + esc(src) + '"></video></div>';
    }
    var yt = v.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([\w-]{11})/) || v.match(/^([\w-]{11})$/);
    var vimeo = v.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    var url = yt ? "https://www.youtube-nocookie.com/embed/" + yt[1] + "?rel=0" :
      vimeo ? "https://player.vimeo.com/video/" + vimeo[1] :
      /^https?:\/\//.test(v) ? v : null;
    if (!url) return "";
    return '<div class="video"><iframe src="' + esc(url) + '" title="' + title + '" loading="lazy" ' +
      'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" ' +
      'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>';
  }

  function loadMarkdown(path) {
    if (mdCache[path]) return Promise.resolve(mdCache[path]);
    return fetch(path, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.text();
    }).then(function (text) {
      mdCache[path] = text;
      return text;
    });
  }

  /* Images and file links in a lesson are relative to the course folder */
  function fixRelativeLinks(root, course) {
    var base = CONTENT_DIR + course.id + "/";
    function isRelative(u) { return u && !/^([a-z][a-z0-9+.-]*:|\/|#|\?)/i.test(u); }
    root.querySelectorAll("img[src]").forEach(function (img) {
      var src = img.getAttribute("src");
      if (isRelative(src)) img.setAttribute("src", base + src);
      img.setAttribute("loading", "lazy");
    });
    root.querySelectorAll("a[href]").forEach(function (a) {
      var h = a.getAttribute("href");
      if (isRelative(h)) a.setAttribute("href", base + h);
      if (/^https?:\/\//i.test(a.getAttribute("href")) && a.host !== location.host) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener");
      }
    });
  }

  /* ---------------- quizzes ----------------
     In a lesson's Markdown:

     :::quiz
     Q: Which tag makes the biggest heading?
     - [ ] `<h6>`
     - [x] `<h1>`
     Why: `<h1>` is the top-level heading.
     :::
  */
  function extractQuizzes(md) {
    var quizzes = [];
    var text = md.replace(/\r\n?/g, "\n").replace(/^:::\s*quiz[^\n]*\n([\s\S]*?)^:::[ \t]*$/gm, function (_, body) {
      quizzes.push(parseQuiz(body));
      return '\n\n<div class="quiz-slot" data-quiz="' + (quizzes.length - 1) + '"></div>\n\n';
    });
    return { markdown: text, quizzes: quizzes };
  }

  function parseQuiz(body) {
    var questions = [];
    var q = null;
    var mode = "q";
    body.split("\n").forEach(function (raw) {
      var line = raw.trim();
      if (!line) return;
      var m;
      if ((m = line.match(/^(?:Q|Question)\s*[:.]\s*(.*)$/i))) {
        q = { text: m[1], options: [], answer: -1, why: "" };
        questions.push(q);
        mode = "q";
      } else if (q && (m = line.match(/^[-*+]\s*\[( |x|X)\]\s*(.*)$/))) {
        if (m[1].toLowerCase() === "x") q.answer = q.options.length;
        q.options.push(m[2]);
        mode = "o";
      } else if (q && (m = line.match(/^(?:Why|Explanation|Because)\s*[:.]\s*(.*)$/i))) {
        q.why = m[1];
        mode = "w";
      } else if (q) {
        if (mode === "w") q.why += " " + line;
        else if (mode === "q") q.text += " " + line;
      }
    });
    return questions.filter(function (x) { return x.options.length > 1 && x.answer >= 0; });
  }

  function buildQuiz(course, lesson, questions, n, onChange) {
    var section = document.createElement("section");
    section.className = "quiz";
    if (!questions || !questions.length) return section;
    var state = quizState(course.id, lesson.id);
    var uid = "q" + n + "-" + Math.random().toString(36).slice(2, 7);

    section.innerHTML = '<div class="quiz-head"><h2>' + t("quizTitle") + '</h2><p class="quiz-score" aria-live="polite"></p></div>' +
      questions.map(function (q, i) {
        var name = uid + "-" + i;
        return '<fieldset class="question" data-i="' + i + '"><legend>' + inlineMd(q.text) + "</legend>" +
          q.options.map(function (o, k) {
            return '<label class="option"><input type="radio" name="' + name + '" value="' + k + '"><span>' + inlineMd(o) + "</span></label>";
          }).join("") +
          '<button type="button" class="btn btn-quiet check">' + t("checkAnswer") + "</button>" +
          '<div class="feedback" aria-live="polite"></div></fieldset>';
      }).join("");

    function score() {
      var right = 0;
      questions.forEach(function (q, i) { var st = state[n + "-" + i]; if (st && st.correct) right++; });
      var answered = questions.some(function (q, i) { return state[n + "-" + i]; });
      section.querySelector(".quiz-score").textContent = answered ? t("quizScore", { right: right, total: questions.length }) : "";
    }

    function show(fs, i, choice) {
      var q = questions[i];
      var correct = choice === q.answer;
      var fb = fs.querySelector(".feedback");
      fs.querySelectorAll(".option").forEach(function (lab, k) {
        lab.classList.remove("is-right", "is-wrong");
        if (correct && k === q.answer) lab.classList.add("is-right");
        if (!correct && k === choice) lab.classList.add("is-wrong");
      });
      fb.className = "feedback " + (correct ? "right" : "wrong");
      fb.innerHTML = '<p class="verdict">' + (correct ? t("correct") : t("incorrect")) + "</p>" +
        (correct && q.why ? '<p class="why">' + inlineMd(q.why) + "</p>" : "");
      if (correct) {
        fs.querySelectorAll("input").forEach(function (inp) { inp.disabled = true; });
        fs.querySelector(".check").hidden = true;
      }
    }

    section.querySelectorAll(".question").forEach(function (fs) {
      var i = Number(fs.getAttribute("data-i"));
      var saved = state[n + "-" + i];
      if (saved && typeof saved.choice === "number") {
        var input = fs.querySelectorAll("input")[saved.choice];
        if (input) input.checked = true;
        show(fs, i, saved.choice);
      }
      fs.querySelector(".check").addEventListener("click", function () {
        var picked = fs.querySelector("input:checked");
        var fb = fs.querySelector(".feedback");
        if (!picked) {
          fb.className = "feedback wrong";
          fb.innerHTML = '<p class="verdict">' + t("chooseFirst") + "</p>";
          return;
        }
        var choice = Number(picked.value);
        state[n + "-" + i] = { choice: choice, correct: choice === questions[i].answer };
        saveProgress();
        show(fs, i, choice);
        score();
        onChange();
      });
      fs.addEventListener("change", function () {
        fs.querySelectorAll(".option").forEach(function (lab) { lab.classList.remove("is-wrong"); });
      });
    });
    score();
    return section;
  }

  /* ---------------- certificate ---------------- */

  function renderCertificate(course) {
    setTitle(t("certTitle") + ": " + course.title);
    var s = stats(course);
    var head = '<p class="crumbs"><a href="#/">' + t("allCourses") + '</a> / <a href="' + href("course", course.id) + '">' + esc(course.title) + "</a></p>";

    if (!s.finished) {
      main.innerHTML = '<div class="wrap cert-page"' + lineStyle(course) + ">" + head +
        '<h1 tabindex="-1" style="font-size:var(--t-xl);margin-top:1rem">' + t("certTitle") + "</h1>" +
        '<p style="margin-top:1rem;color:var(--ink-2)">' + t("certLocked", { n: s.total, left: s.total - s.done }) + "</p>" +
        (s.next ? '<p style="margin-top:1.5rem"><a class="btn" href="' + href("course", course.id, s.next.lesson.id) + '">' +
          esc(t("continueTo", { title: s.next.lesson.title })) + "</a></p>" : "") +
        "</div>";
      return;
    }

    var date = s.lastDoneAt ? new Date(s.lastDoneAt) : new Date();
    var dateText;
    try { dateText = date.toLocaleDateString(SITE.lang || undefined, { year: "numeric", month: "long", day: "numeric" }); }
    catch (e) { dateText = date.toDateString(); }
    var teacher = course.teacher || SITE.teacher || "";
    var name = getName();

    main.innerHTML = '<div class="wrap cert-page"' + lineStyle(course) + ">" + head +
      '<div class="cert-intro"><h1 tabindex="-1" style="font-size:var(--t-xl);margin-top:1rem">' + t("certTitle") + "</h1>" +
      '<p style="margin-top:0.6rem;color:var(--ink-2)">' + t("certIntro") + "</p></div>" +
      '<div class="cert-controls"><label>' + t("certName") +
        '<input id="cert-name" type="text" autocomplete="name" maxlength="60" value="' + esc(name) + '" placeholder="' + esc(t("certNamePlaceholder")) + '"></label>' +
        '<button type="button" class="btn" id="cert-print">' + t("certPrint") + "</button></div>" +
      '<div class="certificate">' +
        "<div>" +
          '<p class="cert-top">' + t("certTop") + "</p>" +
          '<p class="cert-name' + (name ? "" : " placeholder") + '" id="cert-name-out">' + esc(name || t("certNamePlaceholder")) + "</p>" +
          '<p class="cert-course">' + t("certCompleted") + "</p>" +
          '<p class="cert-course-title">' + esc(course.title) + "</p>" +
        "</div>" +
        '<div class="cert-foot">' +
          "<div>" + t("certDate") + "<strong>" + esc(dateText) + "</strong></div>" +
          (teacher ? "<div>" + t("certTeacher") + "<strong>" + esc(teacher) + "</strong></div>" : "") +
          "<div>" + esc(SITE.title || "") + "<strong>" + lessonCountText(s.total) + (s.minutes ? ", " + formatTime(s.minutes).toLowerCase() : "") + "</strong></div>" +
        "</div>" +
        '<div class="cert-route">' + routeH(course, s) + "</div>" +
      "</div></div>";

    var input = document.getElementById("cert-name");
    var out = document.getElementById("cert-name-out");
    input.addEventListener("input", function () {
      var v = input.value.trim();
      out.textContent = v || t("certNamePlaceholder");
      out.classList.toggle("placeholder", !v);
      saveName(v);
    });
    document.getElementById("cert-print").addEventListener("click", function () {
      if (!input.value.trim()) { input.focus(); return; }
      window.print();
    });
  }

  /* ---------------- errors ---------------- */

  function renderNotFound() {
    setTitle(t("notFound"));
    main.innerHTML = '<div class="wrap"><div class="notice" style="border-color:var(--rule-strong)"><h1 tabindex="-1">' + t("notFound") +
      "</h1><p>" + t("notFoundHint") + '</p><p style="margin-top:1rem"><a class="btn" href="#/">' + t("allCourses") + "</a></p></div></div>";
  }

  function renderSetupError(title, lines) {
    document.title = "Setup problem";
    main.innerHTML = '<div class="wrap"><div class="notice"><h1 tabindex="-1">' + esc(title) + "</h1>" +
      lines.map(function (l) { return "<p>" + l + "</p>"; }).join("") + "</div></div>";
  }

  function validate(data) {
    var errs = [];
    if (!data || !Array.isArray(data.courses)) {
      errs.push('The file needs a <code>"courses"</code> list.');
      return errs;
    }
    var ids = {};
    data.courses.forEach(function (c, ci) {
      var where = "Course " + (ci + 1) + (c && c.title ? " (" + esc(c.title) + ")" : "");
      if (!c || typeof c !== "object") { errs.push(where + " is not an object."); return; }
      if (!c.id || !/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(c.id)) errs.push(where + ': needs an <code>"id"</code> made of letters, numbers, - or _.');
      else if (ids[c.id]) errs.push(where + ': the id <code>' + esc(c.id) + "</code> is used twice.");
      ids[c.id] = true;
      if (!c.title) errs.push(where + ': needs a <code>"title"</code>.');
      if (!Array.isArray(c.modules) || !c.modules.length) { errs.push(where + ': needs a <code>"modules"</code> list with at least one module.'); return; }
      var lids = {};
      c.modules.forEach(function (m, mi) {
        var mw = where + ", module " + (mi + 1);
        if (!m || !Array.isArray(m.lessons)) { errs.push(mw + ': needs a <code>"lessons"</code> list.'); return; }
        m.lessons.forEach(function (l, li) {
          var lw = mw + ", lesson " + (li + 1);
          if (!l || !l.id || !/^[A-Za-z0-9][A-Za-z0-9_-]*$/.test(l.id)) errs.push(lw + ': needs an <code>"id"</code> made of letters, numbers, - or _.');
          else if (lids[l.id] || l.id === "certificate") errs.push(lw + ": the id <code>" + esc(l.id) + "</code> is already used in this course.");
          else lids[l.id] = true;
          if (l && !l.title) errs.push(lw + ': needs a <code>"title"</code>.');
        });
      });
    });
    return errs;
  }

  /* ---------------- router ---------------- */

  function route() {
    if (!DATA) return;
    var parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean).map(function (p) {
      try { return decodeURIComponent(p); } catch (e) { return p; }
    });
    renderToken++;
    if (parts.length === 0) renderHome();
    else if (parts[0] === "course" && parts[1]) {
      var course = findCourse(parts[1]);
      if (!course) renderNotFound();
      else if (!parts[2]) renderCourse(course);
      else if (parts[2] === "certificate") renderCertificate(course);
      else renderLesson(course, parts[2]);
    } else renderNotFound();

    window.scrollTo(0, 0);
    // After the first page, move keyboard/screen-reader focus to the new page's heading
    var h1 = main.querySelector("h1");
    if (h1 && route.ran) h1.focus({ preventScroll: true });
    route.ran = true;
  }

  /* ---------------- start ---------------- */

  function setupChrome() {
    if (SITE.lang) document.documentElement.lang = SITE.lang;
    if (SITE.dir) document.documentElement.dir = SITE.dir;
    if (SITE.title) document.getElementById("brand-name").textContent = SITE.title;
    var nav = document.querySelector('[data-nav="home"]');
    if (nav) nav.textContent = t("allCourses");
    document.getElementById("footer-text").textContent = SITE.footer || ((SITE.title || "") + (SITE.teacher ? ", " + SITE.teacher : ""));
    var note = document.querySelector(".footer-note");
    var reset = document.getElementById("reset-progress");
    note.firstChild.textContent = t("progressNote") + " ";
    reset.textContent = t("resetProgress");
    var armed = null;
    reset.addEventListener("click", function () {
      if (!armed) {
        reset.textContent = t("resetConfirm");
        armed = setTimeout(function () { armed = null; reset.textContent = t("resetProgress"); }, 4000);
        return;
      }
      clearTimeout(armed);
      armed = null;
      progress = {};
      saveProgress();
      reset.textContent = t("resetProgress");
      route();
    });
  }

  function start() {
    fetch(CONTENT_DIR + "courses.json", { cache: "no-cache" })
      .then(function (r) {
        if (!r.ok) throw { kind: "missing", status: r.status };
        return r.text();
      })
      .then(function (text) {
        var data;
        try { data = JSON.parse(text); }
        catch (e) { throw { kind: "json", message: e.message, text: text }; }
        var errs = validate(data);
        if (errs.length) throw { kind: "invalid", errors: errs };
        DATA = data;
        SITE = data.site || {};
        if (SITE.text) Object.keys(SITE.text).forEach(function (k) { TEXT[k] = SITE.text[k]; });
        setupChrome();
        window.addEventListener("hashchange", route);
        route();
      })
      .catch(function (err) {
        if (location.protocol === "file:") {
          return renderSetupError("Open the site through a web server", [
            "Browsers don't let a page opened by double-clicking <code>index.html</code> read the course files.",
            "To preview on your computer, open a terminal in this folder and run <code>python3 -m http.server 8000</code>, then visit <code>http://localhost:8000</code>.",
            "On GitHub Pages it works automatically."
          ]);
        }
        if (err && err.kind === "json") {
          var line = "";
          var pos = /position (\d+)/.exec(err.message);
          if (pos && !/line \d+/.test(err.message)) line = " Look near line " + (err.text.slice(0, Number(pos[1])).split("\n").length) + ".";
          return renderSetupError("content/courses.json has a typing mistake", [
            "The browser said: <code>" + esc(err.message) + "</code>." + line,
            "Common causes: a missing comma between items, a comma after the last item, or a missing quote mark. Paste the file into jsonlint.com to find it fast."
          ]);
        }
        if (err && err.kind === "invalid") {
          return renderSetupError("content/courses.json needs a few fixes", err.errors.slice(0, 12));
        }
        if (err && err.kind === "missing") {
          return renderSetupError("The course list couldn't be found", [
            "The site looked for <code>content/courses.json</code> and got error " + err.status + ". Check that the file is in the repository."
          ]);
        }
        renderSetupError("Something went wrong while loading the courses", ["<code>" + esc(err && err.message || String(err)) + "</code>"]);
      });
  }

  start();
})();
