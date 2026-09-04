const API = "http://127.0.0.1:5000/api/ai/analyze";

const statusEl = document.getElementById("status");
const problemEl = document.getElementById("problem");
const platformEl = document.getElementById("platform");
const titleEl = document.getElementById("title");
const generateBtn = document.getElementById("generate");
const hintsEl = document.getElementById("hints");
const revealBtn = document.getElementById("reveal");
const solutionEl = document.getElementById("solution");
const complexityEl = document.getElementById("complexity");

let currentProblem = null;
let help = null;
let unlockedHints = 1;

function show(el) {
  el.classList.remove("hidden");
}

function hide(el) {
  el.classList.add("hidden");
}

function setStatus(text) {
  statusEl.textContent = text;
  show(statusEl);
}

function isSupportedUrl(url) {
  return ["leetcode.com", "geeksforgeeks.org", "codeforces.com", "hackerrank.com"].some(
    (host) => url.includes(host)
  );
}

async function getProblemFromTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.id) {
    throw new Error("No active tab found.");
  }

  if (!isSupportedUrl(tab.url || "")) {
    const err = new Error("Open a LeetCode, GFG, Codeforces, or HackerRank problem.");
    err.unsupported = true;
    throw err;
  }

  try {
    return await chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_PROBLEM" });
  } catch {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["src/content/ProblemExtractor.js", "src/content/Content.js"],
    });
    return chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_PROBLEM" });
  }
}

function renderHints() {
  hintsEl.innerHTML = "";
  const hints = (help?.hints || []).slice(0, 3);

  hints.forEach((hint, index) => {
    const card = document.createElement("article");
    card.className = "card";

    if (index < unlockedHints) {
      card.innerHTML = `
        <strong>Hint ${index + 1}: ${hint.title || ""}</strong>
        <p>${hint.body || ""}</p>
      `;
    } else {
      const locked = document.createElement("button");
      locked.type = "button";
      locked.textContent =
        index === unlockedHints
          ? `Unlock hint ${index + 1}`
          : `Hint ${index + 1} locked`;
      locked.disabled = index !== unlockedHints;
      locked.addEventListener("click", () => {
        unlockedHints += 1;
        renderHints();
      });
      card.appendChild(locked);
    }

    hintsEl.appendChild(card);
  });

  show(hintsEl);
  show(revealBtn);
}

function renderSolution() {
  const s = help?.solution || {};
  solutionEl.innerHTML = `
    <h3>Solution</h3>
    <p>${s.explanation || ""}</p>
    <pre><code>${s.code || ""}</code></pre>
  `;
  show(solutionEl);

  const c = help?.complexity || {};
  complexityEl.innerHTML = `
    <h3>Complexity</h3>
    <p><strong>Time:</strong> ${c.time || "—"}</p>
    <p><strong>Space:</strong> ${c.space || "—"}</p>
    <p>${c.explanation || ""}</p>
  `;
  show(complexityEl);
}

async function detectProblem() {
  setStatus("Reading this page…");
  hide(problemEl);
  hide(generateBtn);

  try {
    const response = await getProblemFromTab();
    if (!response?.ok || !response.problem) {
      throw new Error(response?.error || "Could not read a problem from this page.");
    }

    currentProblem = response.problem;
    platformEl.textContent = currentProblem.platform;
    titleEl.textContent = currentProblem.title;
    hide(statusEl);
    show(problemEl);
    show(generateBtn);
  } catch (error) {
    setStatus(error.message || "Could not detect a problem.");
  }
}

generateBtn.addEventListener("click", async () => {
  if (!currentProblem) return;

  generateBtn.disabled = true;
  setStatus("Asking Gemini…");
  hide(hintsEl);
  hide(revealBtn);
  hide(solutionEl);
  hide(complexityEl);

  try {
    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentProblem),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to generate hints.");

    help = data;
    unlockedHints = 1;
    hide(statusEl);
    renderHints();
  } catch (error) {
    setStatus(error.message || "Gemini request failed. Is the backend running?");
  } finally {
    generateBtn.disabled = false;
  }
});

revealBtn.addEventListener("click", () => {
  renderSolution();
});

detectProblem();