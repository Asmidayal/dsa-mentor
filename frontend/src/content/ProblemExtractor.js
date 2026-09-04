function textOf(el) {
  return (el?.innerText || el?.textContent || "").replace(/\s+\n/g, "\n").trim();
}

function firstMatch(selectors) {
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el && textOf(el)) return el;
  }
  return null;
}

function detectPlatform() {
  const href = window.location.href;
  if (/leetcode\.com/i.test(href)) return "LeetCode";
  if (/geeksforgeeks\.org/i.test(href)) return "GeeksforGeeks";
  if (/codeforces\.com/i.test(href)) return "Codeforces";
  if (/hackerrank\.com/i.test(href)) return "HackerRank";
  return "Unknown";
}

function extractLeetCode() {
  const titleEl = firstMatch([
    "div[data-cy='question-title']",
    ".text-title-large",
    '[class*="text-title-large"]',
  ]);
  const descEl = firstMatch([
    'div[data-track-load="description_content"]',
    ".elfjS",
    '[class*="question-content"]',
  ]);
  const difficultyEl = firstMatch(['[class*="text-difficulty"]']);

  return {
    title: textOf(titleEl) || document.title.replace(/ - LeetCode.*/, "").trim(),
    description: textOf(descEl),
    difficulty: textOf(difficultyEl),
  };
}

function extractGeeksforGeeks() {
  const titleEl = firstMatch(["h1", '[class*="problems_header_content__title"]']);
  const descEl = firstMatch([
    '[class*="problems_problem_content"]',
    ".problem-statement",
    "article",
  ]);
  return {
    title: textOf(titleEl) || document.title.replace(/ \| GeeksforGeeks.*/, "").trim(),
    description: textOf(descEl),
    difficulty: "",
  };
}

function extractCodeforces() {
  const titleEl = firstMatch([".problem-statement .title", ".title"]);
  const descEl = firstMatch([".problem-statement"]);
  return {
    title: textOf(titleEl) || document.title.replace(/ - Codeforces.*/, "").trim(),
    description: textOf(descEl),
    difficulty: "",
  };
}

function extractHackerRank() {
  const titleEl = firstMatch(["h1.ui-icon-label", ".challenge-name", "h1"]);
  const descEl = firstMatch([
    "#content .challenge-body-html",
    ".challenge-text",
    ".problem-statement",
  ]);
  return {
    title: textOf(titleEl) || document.title.replace(/ \| HackerRank.*/, "").trim(),
    description: textOf(descEl),
    difficulty: "",
  };
}

function extractProblemFromPage() {
  const platform = detectPlatform();
  let extracted;

  if (platform === "LeetCode") extracted = extractLeetCode();
  else if (platform === "GeeksforGeeks") extracted = extractGeeksforGeeks();
  else if (platform === "Codeforces") extracted = extractCodeforces();
  else if (platform === "HackerRank") extracted = extractHackerRank();
  else {
    throw new Error("This site is not supported.");
  }

  const title = (extracted.title || "").slice(0, 300);
  const description = (extracted.description || "").slice(0, 12000);

  if (!title && description.length < 40) {
    throw new Error("No problem statement was found on this page.");
  }

  return {
    platform,
    title: title || "Untitled problem",
    description,
    difficulty: extracted.difficulty || "",
    url: window.location.href,
  };
}