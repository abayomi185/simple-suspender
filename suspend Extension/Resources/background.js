let preferences = {
  suspendDuration: 30,
};

let tabStates = {};

browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.set({
    preferences: preferences,
    tabStates: tabStates,
  });
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received request: ", request);

  if (request.greeting === "hello") sendResponse({ farewell: "goodbye" });
});

// window.setTimeout(() => {
//   console.log(browser.storage.local.get());
// }, 10000);

// check if we are running the interval tabstate already
// window.setTimeout(() => {
//   if (!interval) {
//     // default value
//     interval = window.setInterval(
//       () => {
//         sendTabState();
//       },
//       preferences.minsToSuspend
//         ? preferences.minsToSuspend * 60 * 1000 + 1000
//         : 25000
//     );
//   }
// }, 10000);

//browser.runtime.onSuspend(() => {
//  browser.storage.local.set(state)
//})

// const templateUrl = browser.runtime.getURL("suspend-template.html");
// browser.tabs.create({ url: templateUrl });

browser.tabs.onActivated.addListener((activeTab) => {
  chrome.tabs.get(activeTab.tabId, function (tab) {
    // console.log(tab);
  });
});

browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
  console.log(tabId);
  console.log(removeInfo); // {isWindowClosing, windowId}
});
