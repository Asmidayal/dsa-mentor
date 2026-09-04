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
function addFloatingLogo() {
  if (document.getElementById("dsa-mentor-float")) return;

  const btn = document.createElement("button");
  btn.id = "dsa-mentor-float";
  btn.title = "Open DSA Mentor";
  btn.style.cssText = `
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 2147483647;
    width: 56px;
    height: 56px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: #4c1d95;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    overflow: hidden;
  `;

  const img = document.createElement("img");
  img.src = chrome.runtime.getURL("icons/icon48.png");
  img.alt = "DSA Mentor";
  img.style.cssText = "width:100%;height:100%;object-fit:cover;display:block;";
  btn.appendChild(img);

  btn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "OPEN_POPUP" });
  });

  document.body.appendChild(btn);
}

addFloatingLogo();
