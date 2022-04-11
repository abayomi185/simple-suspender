const actions = {
  FORCE_SUSPEND: "FS",
  SUSPEND_ALL: "SA",
  UNSUSPEND_ALL: "UA",
  NEVER_SUSPEND_TAB: "NT",
  NEVER_SUSPEND_URL: "NU",
  NEVER_SUSPEND_DOMAIN: "ND",
};

let preferences = {
  suspendDuration: 30,
};

let tabStates = {};

let tabWhitelist = [];
let urlWhitelist = [];
let domainWhitelist = [];

browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.set({
    actions: actions,
    preferences: preferences,
    tabStates: tabStates,
  });
});

const templateUrl = browser.runtime.getURL("suspend-template.html");
const extensionUrlId = templateUrl.match(/(?<=\:\/\/)(.*?)(?=\/)/)[0];
re = new RegExp(`/${extensionUrlId}/`);

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

const suspend = (tabId) => {};

const forceSuspend = (tabId) => {
  if (!re.test(tabStates[tabId].url)) {
    browser.tabs.update(tabId, {
      url: `${templateUrl}?url=${tabStates[tabId].url}`,
    });
    tabStates[tabId].suspended = true;
  }
};

const suspendAll = () => {};
const unsuspendAll = () => {};

browser.tabs.query({}, function (tabs) {
  //     favicon: tab.favIconUrl,
  //     discarded: tab.discarded,
  //     lastActiveTime: tab.lastAccessed,
  //     forcedSuspend: false,
  //     attention: tab.attention,

  for (let tab of tabs) {
    tabStates[tab.id] = {
      active: tab.active,
      status: tab.status,
      audible: tab.audible,
      url: tab.url,
      title: tab.title,
      incognito: tab.incognito,
      suspended: false,
    };
  }
  // console.log(tabStates);
});

browser.tabs.onActivated.addListener((activeTab) => {
  // console.log(activeTab);
  chrome.tabs.get(activeTab.tabId, function (tab) {
    if (tabStates[tab.id] === undefined) {
      tabStates[tab.id] = tab;
      console.log("new tab");
      console.log(tabStates);
    }
  });
});

browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
  // debug log
  // console.log(tabId);
  // console.log(removeInfo); // {isWindowClosing, windowId}
  delete tabStates[tabId];
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received request: ", request);

  if (request.greeting === "hello") sendResponse({ farewell: "goodbye" });

  switch (request.action) {
    case actions.FORCE_SUSPEND:
      forceSuspend(request.activeTab);
      break;

    default:
      break;
  }
});
