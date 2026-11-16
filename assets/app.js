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
    subject: "Subject",
    type: "Type",
    skill: "Skill",
    duration: "Duration",
    courseType: "Course",
    sortBy: "Sort by:",
    sortRecommended: "Recommended",
    sortAZ: "Title A to Z",
    sortShortest: "Shortest first",
    sortLongest: "Longest first",
    filters: "Filters",
    clearFilters: "Clear all filters",
    showAll: "Show all {n}",
    showFewer: "Show fewer",
    durShort: "Under 2 hours",
    durMedium: "2 to 5 hours",
    durLong: "More than 5 hours",
    hoursN: "{n} hours",
    hour1: "1 hour",
    minutesN: "{n} minutes",
    percentDone: "{n}% done",
    completed: "Completed",
    matching: "{shown} of {total} courses match your filters.",
    noResults: "No courses match these filters.",
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
    stepsDone: "of {total} lessons and projects done",
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
    courseOutline: "Course Outline",
    skipToContent: "Skip to content",
    language: "Language",
    notTranslated: "This lesson hasn't been translated yet, so it's shown in its original language.",
    showLessons: "Show lessons",
    hideLessons: "Hide lessons",
    prerequisites: "Prerequisites",
    prerequisitesIntro: "Before you start, you should be comfortable with:",
    skillsTitle: "Skills you'll learn",
    projectsCount: "{n} projects",
    oneProject: "1 project",
    projectWord: "Project",
    projectsWord: "Projects",
    lessonPill: "L{n}",
    projectPill: "P",
    readyToSubmit: "Ready to submit?",
    submitText: "When your work meets every requirement above, send it in for review.",
    submitProject: "Submit your project",
    submitHint: "Your teacher will tell you how to submit this project.",
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
    listSep: ", ",
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
  var LANG_KEY = "course-site-lang";
  var BASE_LANG = "en";          // language of courses.json and the plain .md lesson files
  var LANG = null;               // the language being shown: { code, name, dir }
  var LANGS = [];
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

  /* Lesson length: "45 min" under an hour, otherwise "1.5 hours" */
  function lessonTime(minutes) {
    return minutes >= 60 ? formatDuration(minutes) : t("minutesShort", { n: minutes });
  }

  /* Short duration for cards: "45 minutes", "1 hour", "2.5 hours" */
  function formatDuration(minutes) {
    if (!minutes) return "";
    if (minutes < 55) return t("minutesN", { n: Math.max(5, Math.round(minutes / 5) * 5) });
    var h = Math.round(minutes / 30) / 2;
    return h <= 1 ? t("hour1") : t("hoursN", { n: h });
  }

  /* ---------------- icons ---------------- */

  function svgIcon(paths, cls) {
    return '<svg class="' + (cls || "icon") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + "</svg>";
  }

  var ICONS = {
    subject: '<path d="M3 9.5 12 4l9 5.5"/><path d="M5.5 10v8M10 10v8M14 10v8M18.5 10v8"/><path d="M3 20h18"/>',
    type: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7.5h6M9 11h6"/>',
    skill: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/><circle cx="12" cy="12" r="6.6"/>',
    level: '<path d="M5 8h14M5 12h14M5 16h14"/>',
    duration: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.6M9.8 2.8h4.4M12 2.8v3.2M18 6.6l1.3-1.3"/>',
    chevron: '<path d="M6 9l6 6 6-6"/>',
    sort: '<path d="M4 6h10M4 11h7M4 16h5M17.5 5v14M14.5 16l3 3 3-3"/>',
    filter: '<path d="M4 5h16l-6 7.5V19l-4-2v-4.5z"/>',
    course: '<path d="M3 5.6c2.6-1 5.6-1 9 1 3.4-2 6.4-2 9-1v13.6c-2.6-1-5.6-1-9 1-3.4-2-6.4-2-9-1z"/><path d="M12 6.6v13.6"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    lessons: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
    teacher: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6"/>',
    lessonDoc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4"/><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M19 8v3M9 9h2M9 13h4"/><rect x="13" y="14" width="8" height="7" rx="1.5"/><path d="M15.5 16.5h3M15.5 18.5h2"/>'
  };

  var BADGES = {
    web: '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16"/>',
    code: '<path d="M8.5 4C6.5 4 6 5 6 7v2.5C6 11 5 12 3.5 12 5 12 6 13 6 14.5V17c0 2 .5 3 2.5 3M15.5 4c2 0 2.5 1 2.5 3v2.5c0 1.5 1 2.5 2.5 2.5-1.5 0-2.5 1-2.5 2.5V17c0 2-.5 3-2.5 3"/>',
    branches: '<circle cx="6" cy="5" r="2.2"/><circle cx="6" cy="19" r="2.2"/><circle cx="18" cy="6.5" r="2.2"/><path d="M6 7.2v9.6M18 8.7c0 5.3-6.5 4-11 8.3"/>',
    terminal: '<path d="M4 6.5l5.5 5.5L4 17.5M12 18h8"/>',
    chart: '<path d="M5 19v-6M10 19V5M15 19v-9M20 19v-4"/>',
    server: '<ellipse cx="12" cy="5.5" rx="7" ry="2.8"/><path d="M5 5.5v13c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8v-13M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8"/>',
    document: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><circle cx="10" cy="11" r="1.8"/><path d="M8 16h8M13.5 11H16"/>'
  };

  /* Pick a cover style from the course's "cover" field, or guess from its tags */
  function coverKind(course) {
    if (course.cover && BADGES[course.cover]) return course.cover;
    var tags = (course.tags || course.skills || []).join(" ").toLowerCase() + " " + course.title.toLowerCase();
    if (/resume|career|job|interview|\bcv\b/.test(tags)) return "document";
    if (/git|version/.test(tags)) return "branches";
    if (/flask|backend|\bapi|server|database|sql/.test(tags)) return "server";
    if (/linux|terminal|bash|shell|command/.test(tags)) return "terminal";
    if (/html|css|web/.test(tags)) return "web";
    if (/python|program|code|java/.test(tags)) return "code";
    return "chart";
  }

  function seeded(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return function () {
      h += 0x6D2B79F5;
      var x = Math.imul(h ^ (h >>> 15), 1 | h);
      x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  var coverCount = 0;

  /* Generated cover art; a course "image" in courses.json replaces it */
  function coverHtml(course) {
    var kind = coverKind(course);
    var badge = '<span class="card-badge">' + svgIcon(BADGES[kind], "badge-icon").replace('stroke-width="1.8"', 'stroke-width="2.2"') + "</span>";
    if (course.image) {
      var src = /^(https?:)?\/\//.test(course.image) ? course.image : CONTENT_DIR + course.image;
      return '<div class="card-cover"><img src="' + esc(src) + '" alt="" loading="lazy">' + badge + "</div>";
    }
    var id = "cv" + (++coverCount);
    var accent = course.color || "#2563eb";
    var rnd = seeded(course.id);
    var light = "#8fb4ff", bright = "#4d7dff", deep = "#0d2378";
    var art = "";

    function win(x, y, w, h, fill, op) {
      return '<g opacity="' + (op || 1) + '"><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8" fill="' + fill + '" stroke="' + bright + '" stroke-opacity=".7"/>' +
        '<path d="M' + x + " " + (y + 18) + "h" + w + '" stroke="' + bright + '" stroke-opacity=".5"/>' +
        '<circle cx="' + (x + 11) + '" cy="' + (y + 9) + '" r="3" fill="' + accent + '"/><circle cx="' + (x + 21) + '" cy="' + (y + 9) + '" r="3" fill="' + light + '" fill-opacity=".6"/><circle cx="' + (x + 31) + '" cy="' + (y + 9) + '" r="3" fill="' + light + '" fill-opacity=".35"/></g>';
    }

    if (kind === "chart") {
      var tops = [];
      for (var i = 0; i < 34; i++) {
        var x = 30 + i * 9.4;
        var hgt = 18 + Math.pow(Math.sin(i / 5) * 0.5 + 0.5, 1.5) * 70 + rnd() * 40;
        tops.push(x + 3 + "," + (165 - hgt));
        art += '<rect x="' + x.toFixed(1) + '" y="' + (165 - hgt).toFixed(1) + '" width="6" height="' + hgt.toFixed(1) + '" rx="2" fill="url(#' + id + 'bar)"/>';
      }
      art = '<linearGradient id="' + id + 'bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + light + '"/><stop offset="1" stop-color="' + bright + '" stop-opacity=".1"/></linearGradient>' +
        art + '<polyline points="' + tops.join(" ") + '" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.5"/>';
    } else if (kind === "web") {
      art = win(92, 52, 170, 112, deep, 0.55) + win(140, 22, 196, 132, "#0b1f6b") +
        '<rect x="152" y="50" width="172" height="22" rx="4" fill="' + accent + '" fill-opacity=".85"/>' +
        '<rect x="152" y="80" width="80" height="62" rx="4" fill="' + light + '" fill-opacity=".25"/>';
      for (var j = 0; j < 5; j++) {
        art += '<rect x="242" y="' + (82 + j * 12) + '" width="' + (40 + rnd() * 42).toFixed(0) + '" height="5" rx="2.5" fill="' + light + '" fill-opacity=".55"/>';
      }
    } else if (kind === "code") {
      art = win(110, 20, 228, 140, "#0a1a5c");
      var palette = [accent, light, bright, "#ffffff"];
      for (var k = 0; k < 8; k++) {
        var yy = 50 + k * 13, xx = 146 + (k % 3 === 1 ? 14 : k % 4 === 3 ? 28 : 0);
        art += '<rect x="122" y="' + yy + '" width="10" height="5" rx="2" fill="' + light + '" fill-opacity=".3"/>';
        var segs = 1 + Math.floor(rnd() * 3);
        for (var s = 0; s < segs; s++) {
          var w2 = 16 + rnd() * 46;
          if (xx + w2 > 328) break;
          art += '<rect x="' + xx.toFixed(0) + '" y="' + yy + '" width="' + w2.toFixed(0) + '" height="6" rx="3" fill="' + palette[Math.floor(rnd() * palette.length)] + '" fill-opacity=".85"/>';
          xx += w2 + 6;
        }
      }
    } else if (kind === "branches") {
      var ys = 112, xs = [40, 92, 144, 196, 248, 300];
      art = '<path d="M20 ' + ys + 'H345" stroke="' + light + '" stroke-width="4" stroke-opacity=".8"/>' +
        '<path d="M92 ' + ys + 'C120 ' + ys + " 118 60 150 60H230C262 60 262 " + ys + " 290 " + ys + '" fill="none" stroke="' + accent + '" stroke-width="4"/>' +
        '<path d="M196 ' + ys + 'C220 ' + ys + ' 216 152 244 152H330" fill="none" stroke="' + bright + '" stroke-width="4" stroke-dasharray="1 9" stroke-linecap="round"/>';
      xs.forEach(function (x) { art += '<circle cx="' + x + '" cy="' + ys + '" r="7" fill="#071548" stroke="' + light + '" stroke-width="3"/>'; });
      [170, 210].forEach(function (x) { art += '<circle cx="' + x + '" cy="60" r="7" fill="#071548" stroke="' + accent + '" stroke-width="3"/>'; });
      art += '<circle cx="290" cy="' + ys + '" r="9" fill="' + accent + '"/>';
    } else if (kind === "server") {
      var rack = "";
      for (var u = 0; u < 3; u++) {
        var ry = 30 + u * 42;
        rack += '<rect x="196" y="' + ry + '" width="136" height="34" rx="6" fill="#0b1f6b" stroke="' + bright + '" stroke-opacity=".7"/>' +
          '<circle cx="212" cy="' + (ry + 17) + '" r="4" fill="' + (u === 1 ? accent : "#3ee0a1") + '"/>' +
          '<rect x="226" y="' + (ry + 11) + '" width="' + (60 + rnd() * 30).toFixed(0) + '" height="5" rx="2.5" fill="' + light + '" fill-opacity=".6"/>' +
          '<rect x="226" y="' + (ry + 20) + '" width="' + (30 + rnd() * 30).toFixed(0) + '" height="5" rx="2.5" fill="' + light + '" fill-opacity=".3"/>' +
          '<path d="M300 ' + (ry + 9) + "v16M308 " + (ry + 9) + "v16M316 " + (ry + 9) + 'v16" stroke="' + bright + '" stroke-width="3" stroke-opacity=".5"/>';
      }
      art = '<path d="M158 72H196M158 114H196" stroke="' + accent + '" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>' +
        '<g fill="#0d2378" stroke="' + light + '" stroke-width="2.5"><path d="M78 52v84c0 9 18 16 40 16V52"/><path d="M158 52v84c0 9-18 16-40 16V52"/>' +
        '<ellipse cx="118" cy="52" rx="40" ry="14"/></g>' +
        '<path d="M78 80c0 9 18 16 40 16s40-7 40-16M78 108c0 9 18 16 40 16s40-7 40-16" fill="none" stroke="' + light + '" stroke-width="2.5" stroke-opacity=".7"/>' +
        '<text x="102" y="100" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="18" font-weight="700" fill="' + accent + '">{ }</text>' + rack;
    } else if (kind === "document") {
      art = '<g transform="rotate(-6 250 95)"><rect x="176" y="18" width="128" height="160" rx="6" fill="#0d2378" stroke="' + bright + '" stroke-opacity=".6"/></g>' +
        '<rect x="196" y="14" width="132" height="168" rx="6" fill="#f8fbff"/>' +
        '<circle cx="222" cy="42" r="13" fill="' + accent + '" fill-opacity=".9"/>' +
        '<rect x="243" y="32" width="66" height="8" rx="4" fill="#0b1f6b"/>' +
        '<rect x="243" y="46" width="44" height="6" rx="3" fill="#8aa0cc"/>' +
        '<rect x="210" y="70" width="40" height="6" rx="3" fill="' + accent + '"/>';
      for (var r = 0; r < 6; r++) {
        art += '<rect x="210" y="' + (84 + r * 11 + (r > 2 ? 12 : 0)) + '" width="' + (60 + rnd() * 44).toFixed(0) + '" height="5" rx="2.5" fill="#b8c6e3"/>';
      }
      art += '<rect x="210" y="114" width="40" height="6" rx="3" fill="' + accent + '"/>' +
        '<path d="M120 120l14 14 28-32" fill="none" stroke="' + accent + '" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>';
    } else {
      art = win(104, 20, 236, 142, "#050b26") +
        '<g font-family="ui-monospace, Menlo, Consolas, monospace" font-size="13" fill="' + light + '">' +
        '<text x="118" y="60"><tspan fill="' + accent + '">$</tspan> whoami</text>' +
        '<text x="118" y="80" fill-opacity=".7">student</text>' +
        '<text x="118" y="104"><tspan fill="' + accent + '">$</tspan> ls projects</text>' +
        '<text x="118" y="124" fill-opacity=".7">notes.txt  website  game.py</text>' +
        '<text x="118" y="148"><tspan fill="' + accent + '">$</tspan></text></g>' +
        '<rect x="132" y="138" width="8" height="13" fill="' + accent + '"/>';
    }

    return '<div class="card-cover"><svg viewBox="0 0 360 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      "<defs>" +
        '<linearGradient id="' + id + 'bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#091a5e"/><stop offset=".55" stop-color="#0b2a9e"/><stop offset="1" stop-color="#040c2c"/></linearGradient>' +
        '<radialGradient id="' + id + 'glow" cx=".72" cy=".3" r=".65"><stop offset="0" stop-color="' + accent + '" stop-opacity=".5"/><stop offset="1" stop-color="' + accent + '" stop-opacity="0"/></radialGradient>' +
        '<pattern id="' + id + 'dots" width="12" height="12" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1" fill="#9db9ff" fill-opacity=".16"/></pattern>' +
      "</defs>" +
      '<rect width="360" height="180" fill="url(#' + id + 'bg)"/>' +
      '<rect width="360" height="180" fill="url(#' + id + 'dots)"/>' +
      '<rect width="360" height="180" fill="url(#' + id + 'glow)"/>' +
      art + "</svg>" + badge + "</div>";
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

  function isProject(lesson) {
    return String(lesson.type || "").toLowerCase() === "project";
  }

  function projectCountText(n) {
    return n === 1 ? t("oneProject") : t("projectsCount", { n: n });
  }

  /* "Course Outline": one card per module, with L1/L2... and P badges */
  function outlineHtml(course, s) {
    var counts = '<p class="outline-counts">' +
      (s.lessons ? "<span>" + svgIcon(ICONS.lessonDoc) + lessonCountText(s.lessons) + "</span>" : "") +
      (s.projects ? "<span>" + svgIcon(ICONS.course) + projectCountText(s.projects) + "</span>" : "") + "</p>";
    var n = 0, pn = 0, projTotal = s.projects;
    function pill(lesson) {
      if (isProject(lesson)) { pn++; return '<span class="pill pill-project">' + t("projectPill") + (projTotal > 1 ? pn : "") + "</span>"; }
      n++;
      return '<span class="pill">' + t("lessonPill", { n: n }) + "</span>";
    }
    var html = '<section class="outline"><div class="outline-head"><h2>' + t("courseOutline") + "</h2>" + counts + "</div>";
    course.modules.forEach(function (m, mi) {
      html += '<div class="outline-module"><h3 class="outline-title">' + esc(m.title) +
        (m.summary ? '<span class="outline-sub">' + esc(m.summary) + "</span>" : "") + '</h3><ol class="outline-list">';
      (m.lessons || []).forEach(function (l) {
        var done = isDone(course.id, l.id);
        var isNext = !done && s.next && s.next.lesson.id === l.id;
        var meta = done ? '<span class="outline-meta is-done">' + svgIcon(ICONS.check) + t("done") + "</span>" :
          isNext ? '<span class="outline-meta is-next">' + t("upNext") + (l.minutes ? t("listSep") + lessonTime(l.minutes) : "") + "</span>" :
          (l.minutes ? '<span class="outline-meta">' + lessonTime(l.minutes) + "</span>" : "");
        html += '<li class="outline-row' + (done ? " done" : "") + '">' + pill(l) +
          '<div class="outline-name"><a href="' + href("course", course.id, l.id) + '">' + esc(l.title) + "</a>" + meta + "</div>" +
          '<p class="outline-desc">' + (l.summary ? inlineMd(l.summary) : "") + "</p></li>";
      });
      // A course-level "project" (not a lesson page) is listed at the end of the last module
      if (course.project && mi === course.modules.length - 1) {
        var p = course.project;
        pn++;
        html += '<li class="outline-row">' + '<span class="pill pill-project">' + t("projectPill") + (projTotal > 1 ? pn : "") + "</span>" +
          '<div class="outline-name">' + (p.url ? '<a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.title || t("project")) + "</a>" :
            '<span class="outline-plain">' + esc(p.title || t("project")) + "</span>") +
          (p.url ? '<span class="outline-meta">' + esc(p.button || t("openProject")) + "</span>" : "") + "</div>" +
          '<p class="outline-desc">' + (p.description ? inlineMd(p.description) : "") + "</p></li>";
      }
      html += "</ol></div>";
    });
    return html + "</section>";
  }

  function doneText(s) {
    return t(s.projectLessons ? "stepsDone" : "lessonsDone", { total: s.total });
  }

  function stats(course) {
    var list = flatLessons(course);
    var done = 0, next = null, minutes = 0, lastDoneAt = null, projects = 0;
    list.forEach(function (item) {
      minutes += Number(item.lesson.minutes) || 0;
      if (isProject(item.lesson)) projects++;
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
      lessons: list.length - projects,
      projects: projects + (course.project ? 1 : 0),
      projectLessons: projects,
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
          (l.minutes ? lessonTime(l.minutes) : "");
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

  /* ---------------- catalog (home) ---------------- */

  // Remembered while the page is open, so filters survive visiting a course and coming back
  var catalog = { sel: {}, sort: "recommended", query: "", open: {}, showFilters: false, allSkills: false };

  function durationBucket(minutes) {
    if (!minutes) return "";
    if (minutes < 120) return t("durShort");
    if (minutes <= 300) return t("durMedium");
    return t("durLong");
  }

  function filterGroups(courses) {
    var defs = [
      { key: "subject", icon: ICONS.subject, get: function (c) { return [c.subject]; } },
      { key: "type", icon: ICONS.type, get: function (c) { return [c.type || t("courseType")]; } },
      { key: "skill", icon: ICONS.skill, get: function (c) { return c.skills || c.tags || []; } },
      { key: "level", icon: ICONS.level, get: function (c) { return [c.level]; } },
      { key: "duration", icon: ICONS.duration, get: function (c) { return [durationBucket(stats(c).minutes)]; } }
    ];
    var levelOrder = ["beginner", "intermediate", "advanced"];
    var durOrder = [t("durShort"), t("durMedium"), t("durLong")];
    return defs.map(function (d) {
      var counts = {};
      courses.forEach(function (c) {
        d.get(c).forEach(function (v) { if (v) counts[v] = (counts[v] || 0) + 1; });
      });
      var values = Object.keys(counts);
      values.sort(function (a, b) {
        if (d.key === "duration") return durOrder.indexOf(a) - durOrder.indexOf(b);
        if (d.key === "level") {
          var ia = levelOrder.indexOf(a.toLowerCase()), ib = levelOrder.indexOf(b.toLowerCase());
          if (ia !== ib) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
        }
        if (d.key === "skill" && counts[b] !== counts[a]) return counts[b] - counts[a];
        return a.localeCompare(b);
      });
      return { key: d.key, icon: d.icon, get: d.get, values: values, counts: counts };
    }).filter(function (g) { return g.values.length > 0; });
  }

  function activeFilterCount() {
    var n = 0;
    Object.keys(catalog.sel).forEach(function (k) { n += catalog.sel[k].length; });
    return n;
  }

  function renderHome() {
    setTitle("");
    var courses = visibleCourses();
    var groups = filterGroups(courses);
    var totals = { lessons: 0, done: 0 };
    courses.forEach(function (c) { var s = stats(c); totals.lessons += s.total; totals.done += s.done; });

    var SKILL_LIMIT = 6;
    var sidebar = '<aside class="filters panel" id="filters" aria-label="' + esc(t("filters")) + '">' +
      (courses.length > 6 ?
        '<div class="filters-search"><label class="visually-hidden" for="q">' + t("searchLabel") + "</label>" +
        '<input id="q" type="search" autocomplete="off" placeholder="' + esc(t("searchPlaceholder")) + '" value="' + esc(catalog.query) + '"></div>' : "") +
      groups.map(function (g) {
        var sel = catalog.sel[g.key] || [];
        var vals = g.values;
        var limited = g.key === "skill" && vals.length > SKILL_LIMIT + 1 && !catalog.allSkills;
        if (limited) vals = vals.slice(0, SKILL_LIMIT);
        return '<details class="filter-group" data-group="' + g.key + '"' + (catalog.open[g.key] ? " open" : "") + ">" +
          "<summary>" + svgIcon(g.icon) + '<span class="label">' + t(g.key) + "</span>" +
            '<span class="active-count"' + (sel.length ? "" : " hidden") + ">" + sel.length + "</span>" +
            svgIcon(ICONS.chevron, "chev") + "</summary>" +
          '<ul class="filter-options">' +
            vals.map(function (v) {
              return '<li><label><input type="checkbox" value="' + esc(v) + '"' + (sel.indexOf(v) >= 0 ? " checked" : "") + ">" +
                '<span class="opt-label">' + esc(v) + '</span><span class="opt-count">' + g.counts[v] + "</span></label></li>";
            }).join("") +
          "</ul>" +
          (g.key === "skill" && g.values.length > SKILL_LIMIT + 1 ?
            '<button type="button" class="link-button filter-more" data-act="more-skills">' +
            (catalog.allSkills ? t("showFewer") : t("showAll", { n: g.values.length })) + "</button>" : "") +
        "</details>";
      }).join("") +
      '<button type="button" class="link-button filters-clear" data-act="clear"' + (activeFilterCount() ? "" : " hidden") + ">" + t("clearFilters") + "</button>" +
    "</aside>";

    var sortOptions = [
      ["recommended", t("sortRecommended")], ["az", t("sortAZ")],
      ["shortest", t("sortShortest")], ["longest", t("sortLongest")]
    ];

    main.innerHTML =
      '<div class="catalog' + (catalog.showFilters ? " show-filters" : "") + '">' +
        sidebar +
        '<section class="results">' +
          '<div class="results-bar panel">' +
            "<div>" +
              '<h1 tabindex="-1">' + t("allCourses") + "</h1>" +
              '<p class="sub" id="results-sub"></p>' +
            "</div>" +
            '<div class="results-tools">' +
              '<button type="button" class="btn btn-quiet filters-toggle" data-act="toggle-filters" aria-controls="filters" aria-expanded="' + catalog.showFilters + '">' +
                svgIcon(ICONS.filter) + "<span>" + t("filters") + "</span></button>" +
              '<label class="sort">' + svgIcon(ICONS.sort) + "<span>" + t("sortBy") + "</span>" +
                '<select id="sort">' + sortOptions.map(function (o) {
                  return '<option value="' + o[0] + '"' + (catalog.sort === o[0] ? " selected" : "") + ">" + o[1] + "</option>";
                }).join("") + "</select></label>" +
            "</div>" +
          "</div>" +
          '<ul class="cards" id="cards"></ul>' +
          '<div class="empty-state panel" id="empty" hidden></div>' +
        "</section>" +
      "</div>";

    var root = main.querySelector(".catalog");
    var list = document.getElementById("cards");
    var empty = document.getElementById("empty");
    var sub = document.getElementById("results-sub");

    function matches(c) {
      for (var i = 0; i < groups.length; i++) {
        var g = groups[i], sel = catalog.sel[g.key];
        if (!sel || !sel.length) continue;
        var vals = g.get(c);
        if (!vals.some(function (v) { return sel.indexOf(v) >= 0; })) return false;
      }
      var q = catalog.query.trim().toLowerCase();
      if (q) {
        var hay = [c.title, c.summary, c.subject, c.level, (c.tags || c.skills || []).join(" ")].join(" ").toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    }

    function draw() {
      var shown = courses.filter(matches);
      var order = courses.slice();
      shown.sort(function (a, b) {
        if (catalog.sort === "az") return a.title.localeCompare(b.title);
        if (catalog.sort === "shortest") return stats(a).minutes - stats(b).minutes;
        if (catalog.sort === "longest") return stats(b).minutes - stats(a).minutes;
        return order.indexOf(a) - order.indexOf(b);
      });
      list.innerHTML = shown.map(courseCard).join("");

      var filtered = activeFilterCount() > 0 || catalog.query.trim();
      if (filtered) sub.textContent = t("matching", { shown: shown.length, total: courses.length });
      else if (totals.done > 0 && totals.done === totals.lessons) sub.textContent = t("overallAll");
      else if (totals.done > 0) sub.innerHTML = t("overallSome", { done: "<strong>" + totals.done + "</strong>", total: totals.lessons });
      else sub.textContent = SITE.tagline || t("overallNone", { lessons: totals.lessons, courses: courses.length });

      empty.hidden = shown.length > 0;
      if (!shown.length) {
        empty.innerHTML = courses.length ?
          "<p>" + t("noResults") + '</p><button type="button" class="btn btn-quiet" data-act="clear">' + t("clearFilters") + "</button>" :
          "<p>" + t("noCourses") + "</p>";
      }
      root.querySelectorAll('[data-act="clear"]').forEach(function (b) {
        if (b.classList.contains("filters-clear")) b.hidden = !activeFilterCount();
      });
      root.querySelectorAll(".filter-group").forEach(function (d) {
        var n = (catalog.sel[d.getAttribute("data-group")] || []).length;
        var badge = d.querySelector(".active-count");
        badge.textContent = n;
        badge.hidden = !n;
      });
      var tog = root.querySelector(".filters-toggle span");
      if (tog) tog.textContent = t("filters") + (activeFilterCount() ? " (" + activeFilterCount() + ")" : "");
    }
    draw();

    root.addEventListener("change", function (e) {
      var el = e.target;
      if (el.id === "sort") { catalog.sort = el.value; draw(); return; }
      var group = el.closest && el.closest(".filter-group");
      if (group && el.type === "checkbox") {
        var key = group.getAttribute("data-group");
        var sel = catalog.sel[key] || (catalog.sel[key] = []);
        var i = sel.indexOf(el.value);
        if (el.checked && i < 0) sel.push(el.value);
        if (!el.checked && i >= 0) sel.splice(i, 1);
        draw();
      }
    });
    root.addEventListener("toggle", function (e) {
      var d = e.target;
      if (d.classList && d.classList.contains("filter-group")) catalog.open[d.getAttribute("data-group")] = d.open;
    }, true);
    root.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest("[data-act]");
      if (!btn) return;
      var act = btn.getAttribute("data-act");
      if (act === "clear") {
        catalog.sel = {};
        catalog.query = "";
        root.querySelectorAll(".filter-group input").forEach(function (i) { i.checked = false; });
        var q = document.getElementById("q");
        if (q) q.value = "";
        draw();
      } else if (act === "toggle-filters") {
        catalog.showFilters = !catalog.showFilters;
        root.classList.toggle("show-filters", catalog.showFilters);
        btn.setAttribute("aria-expanded", String(catalog.showFilters));
      } else if (act === "more-skills") {
        catalog.allSkills = !catalog.allSkills;
        catalog.open.skill = true;
        renderHome();
        var b = main.querySelector('[data-act="more-skills"]');
        if (b) b.focus();
      }
    });
    var search = document.getElementById("q");
    if (search) search.addEventListener("input", function () { catalog.query = search.value; draw(); });
  }

  function courseCard(c) {
    var s = stats(c);
    var status;
    if (s.finished) status = '<span class="card-status finished">' + svgIcon(ICONS.check) + " " + t("completed") + "</span>";
    else if (s.done > 0) status = '<span class="card-status started">' + t("percentDone", { n: Math.round(s.done / s.total * 100) }) + "</span>";
    else status = '<span class="card-status">' + lessonCountText(s.lessons || s.total) + "</span>";

    return '<li class="card"' + lineStyle(c) + '><a href="' + href("course", c.id) + '">' +
      '<div class="card-main">' +
        coverHtml(c) +
        '<div class="card-body">' +
          '<h2 class="card-title">' + esc(c.title) + "</h2>" +
          (c.summary ? '<p class="card-summary">' + esc(c.summary) + "</p>" : "") +
          '<div class="card-meta">' +
            '<span class="card-type">' + svgIcon(ICONS.course) + esc(c.type || t("courseType")) + "</span>" +
            status +
          "</div>" +
        "</div>" +
        (s.done > 0 && !s.finished ? '<div class="card-progress" aria-hidden="true"><span style="width:' + Math.round(s.done / s.total * 100) + '%"></span></div>' : "") +
      "</div>" +
      '<div class="card-foot">' +
        (c.level ? "<span>" + svgIcon(ICONS.level) + esc(c.level) + "</span>" : "<span></span>") +
        (s.minutes ? "<span>" + svgIcon(ICONS.duration) + formatDuration(s.minutes) + "</span>" : "") +
      "</div>" +
    "</a></li>";
  }

  /* ---------------- course page ---------------- */

  function renderCourse(course) {
    setTitle(course.title);
    var s = stats(course);
    var target = s.next || s.list[0];

    var buttonLabel = s.finished ? t("reviewFromStart") :
      s.done === 0 ? t("startFirst") : t("continueTo", { title: s.next.lesson.title });

    function fact(icon, label, value) {
      return "<div><dt>" + svgIcon(icon) + label + "</dt><dd>" + value + "</dd></div>";
    }
    var facts = "";
    if (course.level) facts += fact(ICONS.level, t("level"), esc(course.level));
    facts += fact(ICONS.lessons, t("lessons"), s.lessons);
    if (s.projects) facts += fact(ICONS.course, t(s.projects > 1 ? "projectsWord" : "projectWord"), s.projects);
    if (s.minutes) facts += fact(ICONS.duration, t("time"), formatTime(s.minutes));
    var teacher = course.teacher || SITE.teacher;
    if (teacher) facts += fact(ICONS.teacher, t("teacher"), esc(teacher));

    var aside = "";
    if (s.finished) {
      aside += '<section class="panel aside-block finished"><h2>' + t("finishedTitle") + "</h2><p>" + t("finishedText") + "</p>" +
        '<a class="btn" href="' + href("course", course.id, "certificate") + '">' + t("getCertificate") + "</a></section>";
    }
    if (course.outcomes && course.outcomes.length) {
      aside += '<section class="panel aside-block"><h2>' + t("outcomes") + '</h2><ul class="outcomes">' +
        course.outcomes.map(function (o) { return "<li>" + inlineMd(o) + "</li>"; }).join("") + "</ul></section>";
    }
    var skills = course.skills || course.tags || [];
    if (skills.length) {
      aside += '<section class="panel aside-block"><h2>' + t("skillsTitle") + '</h2><ul class="chips">' +
        skills.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("") + "</ul></section>";
    }
    if (course.prerequisites && course.prerequisites.length) {
      aside += '<section class="panel aside-block"><h2>' + t("prerequisites") + "</h2><p>" + t("prerequisitesIntro") + '</p><ul class="prereqs">' +
        course.prerequisites.map(function (o) { return "<li>" + inlineMd(o) + "</li>"; }).join("") + "</ul></section>";
    }

    main.innerHTML =
      '<section class="course-band"' + lineStyle(course) + ">" +
        '<div class="wrap">' +
          '<p class="crumbs"><a href="#/">' + t("allCourses") + "</a>" + (course.subject ? " / " + esc(course.subject) : "") + "</p>" +
          '<div class="course-hero">' +
            "<div>" +
              '<p class="type-label">' + svgIcon(ICONS.course) + esc(course.type || t("courseType")) + "</p>" +
              '<h1 tabindex="-1">' + esc(course.title) + "</h1>" +
              (course.description || course.summary ? '<p class="summary">' + inlineMd(course.description || course.summary) + "</p>" : "") +
              '<dl class="course-facts">' + facts + "</dl>" +
            "</div>" +
            '<div class="progress-card">' +
              coverHtml(course) +
              '<p class="count"><strong>' + s.done + "</strong> " + doneText(s) + "</p>" +
              routeH(course, s) +
              (target ? '<a class="btn" href="' + href("course", course.id, target.lesson.id) + '">' + esc(buttonLabel) + "</a>" : "") +
            "</div>" +
          "</div>" +
        "</div>" +
      "</section>" +
      '<div class="wrap course-body"' + lineStyle(course) + ">" +
        outlineHtml(course, s) +
        '<aside class="course-aside">' + aside + "</aside>" +
      "</div>";
  }

  function lessonFile(course, lesson, lang) {
    var file = lesson.file || (course.id + "/" + lesson.id + ".md");
    if (lang && lang !== BASE_LANG) file = file.replace(/\.md$/, "." + lang + ".md");
    return CONTENT_DIR + file;
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
            '<summary data-show="' + esc(t("showLessons")) + '" data-hide="' + esc(t("hideLessons")) + '"><span class="nav-course">' + esc(course.title) + "</span>" +
              '<span class="nav-count">' + s.done + " " + doneText(s) + "</span></summary>" +
            routeH(course, s) +
            routeV(course, s, lesson.id) +
            '<p><a class="prev-link" href="' + href("course", course.id) + '">' + t("backToCourse") + "</a></p>" +
          "</details>" +
          '<article class="lesson">' +
            '<header class="lesson-head">' +
              '<p class="where">' + esc(item.module.title) + "</p>" +
              '<h1 tabindex="-1">' + esc(lesson.title) + "</h1>" +
              '<p class="lesson-facts">' + (isProject(lesson) ? t("projectWord") :
                t("lessonOf", { i: s.list.slice(0, item.index + 1).filter(function (x) { return !isProject(x.lesson); }).length, n: s.lessons })) +
                (lesson.minutes ? "<span aria-hidden=\"true\">&ensp;/&ensp;</span>" + lessonTime(lesson.minutes) : "") + "</p>" +
            "</header>" +
            videoHtml(lesson) +
            '<div class="prose" id="lesson-body"><p class="loading" style="padding:0">' + t("loading") + "</p></div>" +
            (isProject(lesson) ?
              '<section class="submit-box"><h2>' + t("readyToSubmit") + "</h2>" +
                (lesson.submitUrl ? "<p>" + t("submitText") + '</p><a class="btn" href="' + esc(lesson.submitUrl) + '" target="_blank" rel="noopener">' + t("submitProject") + "</a>" :
                  "<p>" + t("submitHint") + "</p>") +
              "</section>" : "") +
            '<div class="lesson-actions" id="lesson-actions"></div>' +
            (prev ? '<a class="prev-link" href="' + href("course", course.id, prev.lesson.id) + '">' + esc(t("previous", { title: prev.lesson.title })) + "</a>" : "") +
          "</article>" +
        "</div>" +
      "</div>";

    var token = ++renderToken;
    var quizzes = [];

    // Translated lesson first (e.g. lesson.ckb.md); fall back to the original if it doesn't exist yet
    var translating = LANG && LANG.code !== BASE_LANG;
    var usedFallback = false;
    loadMarkdown(lessonFile(course, lesson, translating ? LANG.code : null)).catch(function (err) {
      if (!translating) throw err;
      usedFallback = true;
      return loadMarkdown(lessonFile(course, lesson));
    }).then(function (md) {
      if (token !== renderToken) return;
      var body = document.getElementById("lesson-body");
      if (usedFallback) {
        body.setAttribute("lang", BASE_LANG);
        body.setAttribute("dir", "ltr");
        md = '<p class="untranslated" lang="' + esc(LANG.code) + '" dir="' + esc(LANG.dir || "ltr") + '">' + esc(t("notTranslated")) + "</p>\n\n" + md;
      }
      var parsed = extractQuizzes(md);
      quizzes = parsed.quizzes;
      body.innerHTML = window.marked ? marked.parse(parsed.markdown) : "<pre>" + esc(parsed.markdown) + "</pre>";
      fixRelativeLinks(body, course);
      // Let students tick Markdown checklists (- [ ] item) while they work
      body.querySelectorAll('li > input[type="checkbox"][disabled]').forEach(function (box) { box.disabled = false; });
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
      nav.querySelector(".nav-count").textContent = s2.done + " " + doneText(s2);
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
    /* A translation can name the months itself ("months": "Jan|Feb|...", "dateFormat": "{d} {month} {y}"),
       because some browsers have no date data for every language. */
    var months = TEXT.months ? String(TEXT.months).split("|") : [];
    if (months.length === 12) {
      dateText = t("dateFormat", { d: date.getDate(), month: months[date.getMonth()], y: date.getFullYear() });
    } else {
      try { dateText = date.toLocaleDateString(SITE.lang || undefined, { year: "numeric", month: "long", day: "numeric" }); }
      catch (e) { dateText = date.toDateString(); }
    }
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
          "<div>" + esc(SITE.title || "") + "<strong>" + lessonCountText(s.lessons) + (s.projects ? t("listSep") + projectCountText(s.projects) : "") + (s.minutes ? t("listSep") + formatTime(s.minutes).toLowerCase() : "") + "</strong></div>" +
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
    document.documentElement.lang = LANG ? LANG.code : (SITE.lang || "en");
    document.documentElement.dir = LANG ? (LANG.dir || "ltr") : (SITE.dir || "ltr");
    var skip = document.querySelector(".skip-link");
    if (skip) skip.textContent = t("skipToContent");
    var sw = document.getElementById("lang-switch");
    if (sw && LANGS.length > 1) {
      sw.setAttribute("aria-label", t("language"));
      sw.innerHTML = LANGS.map(function (l) {
        var on = LANG && l.code === LANG.code;
        return '<button type="button" lang="' + esc(l.code) + '" dir="' + esc(l.dir || "ltr") + '" data-lang="' + esc(l.code) + '" aria-pressed="' + on + '">' + esc(l.name || l.code) + "</button>";
      }).join("");
      sw.hidden = false;
      sw.addEventListener("click", function (e) {
        var b = e.target.closest("[data-lang]");
        if (!b || (LANG && b.getAttribute("data-lang") === LANG.code)) return;
        try { localStorage.setItem(LANG_KEY, b.getAttribute("data-lang")); } catch (err) { /* ignore */ }
        location.reload();
      });
    }
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

  function pickLanguage(code) {
    if (!code) return null;
    for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) return LANGS[i];
    return null;
  }

  /* Merge content/translations/<lang>.json over the original course data */
  function applyTranslation(tr) {
    if (tr.text) Object.keys(tr.text).forEach(function (k) { TEXT[k] = tr.text[k]; });
    if (tr.site) Object.keys(tr.site).forEach(function (k) { if (k !== "lang" && k !== "languages") SITE[k] = tr.site[k]; });
    var all = tr.courses || {};
    var fields = ["title", "summary", "description", "subject", "type", "level", "tags", "skills", "outcomes", "prerequisites", "teacher"];
    DATA.courses.forEach(function (c) {
      var o = all[c.id];
      if (!o) return;
      fields.forEach(function (k) { if (o[k] != null) c[k] = o[k]; });
      if (o.project && c.project) Object.keys(o.project).forEach(function (k) { c.project[k] = o.project[k]; });
      (o.modules || []).forEach(function (om, i) {
        var m = c.modules[i];
        if (!m || !om) return;
        if (om.title) m.title = om.title;
        if (om.summary) m.summary = om.summary;
      });
      if (o.lessons) c.modules.forEach(function (m) {
        (m.lessons || []).forEach(function (l) {
          var ol = o.lessons[l.id];
          if (!ol) return;
          ["title", "summary", "video", "submitUrl"].forEach(function (k) { if (ol[k]) l[k] = ol[k]; });
        });
      });
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
        BASE_LANG = SITE.lang || "en";
        LANGS = (SITE.languages && SITE.languages.length) ? SITE.languages : [{ code: BASE_LANG, name: BASE_LANG, dir: SITE.dir || "ltr" }];
        var saved = null;
        try { saved = localStorage.getItem(LANG_KEY); } catch (e) { /* ignore */ }
        LANG = pickLanguage(saved) || pickLanguage(SITE.defaultLanguage) || pickLanguage(BASE_LANG) || LANGS[0];
        if (LANG.code === BASE_LANG) return null;
        return fetch(CONTENT_DIR + "translations/" + LANG.code + ".json", { cache: "no-cache" })
          .then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; });
      })
      .then(function (translation) {
        if (translation) applyTranslation(translation);
        else {
          if (LANG.code !== BASE_LANG) LANG = pickLanguage(BASE_LANG) || { code: BASE_LANG, dir: SITE.dir || "ltr" };
          if (SITE.text) Object.keys(SITE.text).forEach(function (k) { TEXT[k] = SITE.text[k]; });
        }
        SITE.lang = LANG.code;
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
