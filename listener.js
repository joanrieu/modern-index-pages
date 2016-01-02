chrome.webNavigation.onDOMContentLoaded.addListener(function(details) {
    try {
        chrome.tabs.get(details.tabId, function(tab) {
            if (tab.title.indexOf("Index of ") === 0) {
                chrome.tabs.insertCSS(details.tabId, { file: "style.css" });
                chrome.tabs.executeScript(details.tabId, { file: "injected.js" });
            }
        });
    } catch (e) {
        // onDOMContentLoaded has been fired on a background page
    }
});
