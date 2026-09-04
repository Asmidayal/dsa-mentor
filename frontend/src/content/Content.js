chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "EXTRACT_PROBLEM") return;

  try {
    if (typeof extractProblemFromPage !== "function") {
      sendResponse({
        ok: false,
        error: "Problem extractor is not loaded on this page.",
      });
      return true;
    }

    const problem = extractProblemFromPage();
    sendResponse({ ok: true, problem });
  } catch (error) {
    sendResponse({
      ok: false,
      error: error.message || "Failed to extract the problem.",
    });
  }

  return true;
});