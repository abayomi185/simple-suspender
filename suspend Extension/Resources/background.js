const actions = {
  RELOAD: "RL",
  FORCE_SUSPEND: "FS",
  SUSPEND_ALL: "SA",
  UNSUSPEND_ALL: "UA",
  NEVER_SUSPEND_TAB: "NT",
  NEVER_SUSPEND_URL: "NU",
  NEVER_SUSPEND_DOMAIN: "ND",
  GET_SUSPEND_INFO: "GI",
  GET_TAB_STATES: "GT",
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
    // tabStates: tabStates,
  });
});

const templateUrl = browser.runtime.getURL("suspend-template.html");
const extensionUrlId = templateUrl.match(/\:\/\/(.*?)(?=\/)/)[1];
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

const neverSuspendTab = (tabId) => {};
const neverSuspendDomain = (domain) => {};
const neverSuspendUrl = (url) => {};

const reload = (tabId) => {
  console.log(tabStates[tabId].url);
  browser.tabs.update(tabId, { url: tabStates[tabId].url }, (tab) => {
    tabStates[tab.id].suspended = false;
  });
};

const suspend = (tabId) => {};

const forceSuspend = async (tabId) => {
  const tabCapture = await browser.tabs.captureVisibleTab({
    quality: 40,
  });

  browser.tabs.get(tabId, function (tab) {
    if (!re.test(tabStates[tabId].url)) {
      tabStates[tab.id] = {
        ...tabStates[tab.id],
        active: tab.active,
        status: tab.status,
        audible: tab.audible,
        url: tab.url,
        title: tab.title,
        incognito: tab.incognito,
        suspended: false,
        imageCapture: tabCapture,
      };

      browser.tabs.update(tabId, {
        url: `${templateUrl}?url=${tabStates[tabId].url}`,
        loadReplace: false,
      });
      tabStates[tabId].suspended = true;
    }
  });
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
      neverSuspendTab: neverSuspendTab(tab.id),
      neverSuspendUrl: neverSuspendDomain(tab.id),
      neverSuspendDomain: neverSuspendUrl(tab.id),
    };
  }
});

browser.tabs.onActivated.addListener((activeTab) => {
  // console.log(activeTab);
  browser.tabs.get(activeTab.tabId, function (tab) {
    if (tabStates[tab.id] === undefined) {
      tabStates[tab.id] = {
        active: tab.active,
        status: tab.status,
        audible: tab.audible,
        url: tab.url,
        title: tab.title,
        incognito: tab.incognito,
        suspended: false,
        neverSuspendTab: neverSuspendTab(tab.id),
        neverSuspendUrl: neverSuspendDomain(tab.id),
        neverSuspendDomain: neverSuspendUrl(tab.id),
      };
      console.log("new tab");
      console.log(tabStates);
    }
  });
});

browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
  delete tabStates[tabId];
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received request: ", request);

  if (request.greeting === "hello") sendResponse({ farewell: "goodbye" });

  switch (request.action) {
    case actions.RELOAD:
      console.log(actions.RELOAD);
      reload(request.activeTab);
      break;

    case actions.FORCE_SUSPEND:
      console.log(actions.FORCE_SUSPEND);
      forceSuspend(request.activeTab);
      break;

    case actions.GET_SUSPEND_INFO:
      console.log(actions.GET_SUSPEND_INFO);
      sendResponse({
        tabState: tabStates[request.activeTab],
      });
      break;

    default:
      break;
  }
});
