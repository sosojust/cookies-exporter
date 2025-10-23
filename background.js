// background.js (with full Chrome DevTools cookie fields)
const normalizeSameSite = (s) => {
  if (!s) return "";
  s = String(s).toLowerCase();
  if (s === "no_restriction" || s === "none") return "None";
  if (s === "lax") return "Lax";
  if (s === "strict") return "Strict";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  const makeOutput = (cookies) => {
    return cookies.map((c) => ({
      Name: c.name,
      Value: c.value,
      Domain: c.domain,
      Path: c.path,
      "Expires / Max-Age":
        typeof c.expirationDate === "number"
          ? Math.floor(c.expirationDate)
          : "",
      Size: c.name.length + c.value.length,
      HttpOnly: !!c.httpOnly,
      Secure: !!c.secure,
      SameSite: normalizeSameSite(c.sameSite),
      "Partition Key Site": c.partitionKey ? c.partitionKey.topLevelSite || "" : "",
      "Cross Site": c.partitionKey ? !!c.partitionKey.hasCrossSiteAncestor : false,
      Priority: c.priority || "Medium" // Chrome returns "Low" | "Medium" | "High"
    }));
  };

  if (msg.type === "GET_COOKIES_FOR_URL") {
    chrome.cookies.getAll({ url: msg.url }, (cookies) => {
      sendResponse({ success: true, cookies: makeOutput(cookies) });
    });
    return true;
  }

  if (msg.type === "GET_ALL_COOKIES") {
    chrome.cookies.getAll({}, (cookies) => {
      sendResponse({ success: true, cookies: makeOutput(cookies) });
    });
    return true;
  }
});
