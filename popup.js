// popup.js
const $ = (id) => document.getElementById(id);
const status = $("status");

function setStatus(txt) { status.textContent = txt; }

function downloadJSON(obj, filename = "cookies.json") {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function getActiveTabUrl() {
  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) return resolve(null);
        resolve(tabs[0].url);
      });
    } catch (e) {
      resolve(null);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  $("export-site").addEventListener("click", async () => {
    setStatus("Getting current tab URL...");
    const url = await getActiveTabUrl();
    if (!url) {
      setStatus("Cannot detect active tab URL. Make sure a tab is active and try again.");
      return;
    }
    setStatus("Requesting cookies for: " + url);
    chrome.runtime.sendMessage({ type: "GET_COOKIES_FOR_URL", url }, (resp) => {
      if (!resp) {
        setStatus("No response from background. Check extension permissions or look at Service Worker logs.");
        return;
      }
      if (!resp.success) {
        setStatus("Failed to get cookies.");
        return;
      }
      const cookies = resp.cookies || [];
      setStatus(`Found ${cookies.length} cookies. Preparing download...`);
      const filename = sanitizeFilenameFromUrl(url) || "cookies";
      downloadJSON(cookies, `${filename}_cookies.json`);
      setStatus(`Downloaded ${cookies.length} cookies as ${filename}_cookies.json`);
    });
  });

  $("export-all").addEventListener("click", () => {
    setStatus("Requesting ALL cookies from browser...");
    chrome.runtime.sendMessage({ type: "GET_ALL_COOKIES" }, (resp) => {
      if (!resp) {
        setStatus("No response from background. Check extension permissions or look at Service Worker logs.");
        return;
      }
      if (!resp.success) {
        setStatus("Failed to get all cookies.");
        return;
      }
      const cookies = resp.cookies || [];
      setStatus(`Found ${cookies.length} cookies. Preparing download...`);
      downloadJSON(cookies, `all_cookies.json`);
      setStatus(`Downloaded ${cookies.length} cookies as all_cookies.json`);
    });
  });
});

function sanitizeFilenameFromUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    const host = u.hostname.replace(/[:\/\\?%*|"<> ]+/g, "_");
    const path = u.pathname.replace(/[:\/\\?%*|"<> ]+/g, "_").slice(0, 40);
    return host + (path ? "_" + path : "");
  } catch (e) {
    return null;
  }
}
