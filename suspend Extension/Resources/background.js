const actions = {
  RELOAD: "RL",
  UNSUSPEND: "US",
  FORCE_SUSPEND: "FS",
  SUSPEND_ALL: "SA",
  UNSUSPEND_ALL: "UA",
  NEVER_SUSPEND_TAB: "NT",
  NEVER_SUSPEND_URL: "NU",
  NEVER_SUSPEND_DOMAIN: "ND",
  GET_SUSPEND_INFO: "GI",
  SET_SUSPEND_DURATION: "SD",
};

let preferences = {
  suspendDuration: 30,
};

let tabStates = {};

let tabWhitelist = {};
let urlWhitelist = {};
let domainWhitelist = {};

// On first install
browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.set({
    actions: actions,
    preferences: preferences,
    tabWhitelist: tabWhitelist,
    urlWhitelist: urlWhitelist,
    domainWhitelist: domainWhitelist,
  });
});

// browser.runtime.onSuspend.addListener(() => {});

//TODO:

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

const setNeverSuspendTab = (tabId) => {
  browser.storage.local.get("tabWhitelist", (items) => {
    if (items.tabWhitelist[tabId]) {
      tabStates[tabId].neverSuspendTab = false;
      delete items.tabWhitelist[tabId];
      browser.storage.local.set(items);
    } else {
      items.tabWhitelist[tabId] = true;
      tabStates[tabId].neverSuspendTab = true;
      browser.storage.local.set(items);
    }
  });
};
const setNeverSuspendUrl = (tabId, url) => {
  browser.storage.local.get("urlWhitelist", (items) => {
    if (items.urlWhitelist[url]) {
      tabStates[tabId].neverSuspendUrl = false;
      delete items.tabWhitelist[url];
      browser.storage.local.set(items);
    } else {
      items.urlWhitelist[url] = true;
      tabStates[tabId].neverSuspendUrl = true;
      browser.storage.local.set(items);
    }
  });
};
const setNeverSuspendDomain = (tabId, url) => {
  const domain = new URL(url).hostname;
  browser.storage.local.get("domainWhitelist", (items) => {
    if (items.domainWhitelist[domain]) {
      tabStates[tabId].neverSuspendDomain = false;
      delete items.domainWhitelist[domain];
      browser.storage.local.set(items);
    } else {
      items.domainWhitelist[domain] = true;
      tabStates[tabId].neverSuspendDomain = true;
      browser.storage.local.set(items);
    }
  });
};

const reload = (tabId, reloadNow = true) => {
  browser.tabs.update(tabId, { url: tabStates[tabId].url }, (tab) => {
    tabStates[tab.id].suspended = false;
  });
  if (reloadNow) {
    console.log("reloading");
  } else {
    console.log("reloading in " + preferences.minsToSuspend + " minutes");
  }
};

const suspend = (tabId) => {
  browser.tab.get(tabId, function (tab) {
    if (
      tab.status === "complete" &&
      !tabStates[tab.id].suspended &&
      !tabStates[tab.id].neverSuspendTab &&
      !tabStates[tab.id].neverSuspendUrl &&
      !tabStates[tab.id].neverSuspendDomain &&
      !tabStates[tab.id].audible &&
      !tabStates[tab.id].active &&
      !tabStates[tab.id].incognito &&
      !tabStates[tab.id].muted
    ) {
      forceSuspend(tabId);
    }
  });
};

const forceSuspend = async (tabId) => {
  const tabCapture = await browser.tabs.captureVisibleTab({
    quality: 40,
  });

  browser.tabs.get(tabId, function (tab) {
    console.log(tab);

    if (!re.test(tabStates[tabId].url)) {
      tabStates[tab.id] = {
        ...tabStates[tab.id],
        active: tab.active,
        status: tab.status,
        audible: tab.audible,
        url: tab.url,
        title: tab.title,
        incognito: tab.incognito,
        muted: tab.mutedInfo.muted,
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
      id: tab.id,
      title: tab.title,
      incognito: tab.incognito,
      muted: tab.mutedInfo.muted,
      suspended: false,
    };

    // browser.storage.local.get("tabWhitelist").then((items) => {
    //   tabStates[tab.id].neverSuspendTab = items.tabWhitelist[tab.id] || false;
    // });
    browser.storage.local.get("tabWhitelist", (items) => {
      tabStates[tab.id].neverSuspendTab = items.tabWhitelist[tab.id] || false;
    });
    // browser.storage.local.get("urlWhitelist").then((items) => {
    //   tabStates[tab.id].neverSuspendUrl = items.urlWhitelist[tab.url] || false;
    // });
    browser.storage.local.get("urlWhitelist", (items) => {
      tabStates[tab.id].neverSuspendUrl = items.urlWhitelist[tab.url] || false;
    });
    // browser.storage.local.get("domainWhitelist").then((items) => {
    //   const domain = new URL(tab.url).hostname;
    //   tabStates[tab.id].neverSuspendDomain =
    //     items.domainWhitelist[domain] || false;
    // });
    browser.storage.local.get("domainWhitelist", (items) => {
      const domain = new URL(tab.url).hostname;
      tabStates[tab.id].neverSuspendDomain =
        items.domainWhitelist[domain] || false;
    });
  }

  console.log(tabStates);
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
      };
      browser.storage.local.get("tabWhitelist").then((items) => {
        tabStates[tab.id].neverSuspendTab = items.tabWhitelist[tab.id] || false;
      });
      browser.storage.local.get("urlWhitelist").then((items) => {
        tabStates[tab.id].neverSuspendUrl =
          items.urlWhitelist[tab.url] || false;
      });
      browser.storage.local.get("domainWhitelist").then((items) => {
        const domain = new URL(tab.url).hostname;
        tabStates[tab.id].neverSuspendDomain =
          items.domainWhitelist[domain] || false;
      });
      console.log("new tab");
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
    case actions.SET_SUSPEND_DURATION:
      browser.storage.local.get("preferences", (items) => {
        items.preferences.suspendDuration = request.duration;
        browser.storage.local.set(items);
      });
      break;

    case actions.RELOAD:
      console.log(actions.RELOAD);
      reload(request.activeTab);
      break;

    case actions.UNSUSPEND:
      console.log(actions.UNSUSPEND);
      reload(request.activeTab, false);
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

    case actions.NEVER_SUSPEND_TAB:
      console.log(actions.NEVER_SUSPEND_TAB);
      setNeverSuspendTab(request.activeTab);
      sendResponse({
        tabState: tabStates[request.activeTab],
      });
      break;

    case actions.NEVER_SUSPEND_URL:
      console.log(actions.NEVER_SUSPEND_URL);
      setNeverSuspendUrl(request.activeTab, request.url);
      sendResponse({
        tabState: tabStates[request.activeTab],
      });
      break;

    case actions.NEVER_SUSPEND_DOMAIN:
      console.log(actions.NEVER_SUSPEND_DOMAIN);
      // Convert URL to domain
      setNeverSuspendDomain(request.activeTab, request.url);
      sendResponse({
        tabState: tabStates[request.activeTab],
      });
      break;

    default:
      break;
  }
});
