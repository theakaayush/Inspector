chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["src/inspector.js"]
    });
  } catch (error) {
    console.warn("Inspector cannot run on this page.", error);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message && message.type === "inspector:capture") {
    const options = { format: "png" };
    const capture = sender.tab && sender.tab.windowId !== undefined
      ? chrome.tabs.captureVisibleTab(sender.tab.windowId, options)
      : chrome.tabs.captureVisibleTab(options);
    capture.then(
      (dataUrl) => sendResponse({ ok: true, dataUrl }),
      (error) => sendResponse({ ok: false, error: String((error && error.message) || error) })
    );
    return true;
  }
  return false;
});
