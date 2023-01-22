//  suspend - popup.js
//  Created by Abayomi Ikuru

// Assign DOM elements
// Section Page 1
const sectionPage1 = document.getElementById("section-page-1");
const suspendActiveButton = document.getElementById("suspend-active");
const suspendAllButton = document.getElementById("suspend-all");
suspendAllButton.style.display = "none";
const unsuspendAllButton = document.getElementById("unsuspend-all");
unsuspendAllButton.style.display = "none";

// const optionsButton = document.getElementById("options-button");

// Section Page 2
const sectionPage2 = document.getElementById("section-page-2");
const durationList = document.getElementById("duration-list");
const tabSuspendOption = document.getElementById("tab-suspend-input");
const urlSuspendOption = document.getElementById("url-suspend-input");
const domainSuspendOption = document.getElementById("domain-suspend-input");

// Options
const moreOptionsButton = document.getElementById("more-options-button");
moreOptionsButton.style.display = "none";
const settingsButton = document.getElementById("settings-button");

// Suspend Durations
const durations = {
  never: 0,
  "5 mins": 5,
  "15 mins": 10,
  "30 mins": 30,
  "1 hour": 60,
  "2 hours": 120,
  "4 hours": 240,
  "6 hours": 360,
  "12 hours": 720,
  "1 day": 1440,
};

let actions = {};

// Suspend active button click handler
suspendActiveButton.onclick = async function () {
  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    browser.runtime.sendMessage({
      action: actions.FORCE_SUSPEND,
      activeTab: tabs[0].id,
      url: tabs[0].url,
    });
  });
  window.close();
};

// Suspend all button click handler
suspendAllButton.onclick = async function () {
  browser.runtime.sendMessage({
    action: actions.SUSPEND_ALL,
  });
  window.close();
};

// Unsuspend all button click handler
unsuspendAllButton.onclick = async function () {
  browser.runtime.sendMessage({
    action: actions.UNSUSPEND_ALL,
  });
  window.close();
};

// Onchange call for dropdown list
durationList.onchange = (_) => {
  browser.runtime.sendMessage({
    action: actions.SET_SUSPEND_DURATION,
    duration: durationList.value,
  });
};

// Checkbox for tab suspend
tabSuspendOption.onchange = async (_) => {
  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    browser.runtime.sendMessage({
      action: actions.NEVER_SUSPEND_TAB,
      status: urlSuspendOption.checked,
      activeTab: tabs[0].id,
    });
    getSuspendOptionInfo();
  });
};

// Checkbox for url suspend
urlSuspendOption.onchange = async (_) => {
  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    browser.runtime.sendMessage({
      action: actions.NEVER_SUSPEND_URL,
      status: urlSuspendOption.checked,
      activeTab: tabs[0].id,
      url: tabs[0].url,
    });
    getSuspendOptionInfo();
  });
};

// Checkbox for domain suspend
domainSuspendOption.onchange = async (_) => {
  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    browser.runtime.sendMessage({
      action: actions.NEVER_SUSPEND_DOMAIN,
      status: domainSuspendOption.checked,
      activeTab: tabs[0].id,
      url: tabs[0].url,
    });
    getSuspendOptionInfo();
  });
};

// More-Options button click handler
moreOptionsButton.onclick = function () {
  const optionsUrl = browser.runtime.getURL("options.html");
  browser.tabs.create({ url: optionsUrl });
};
settingsButton.onclick = function () {
  const optionsUrl = browser.runtime.getURL("options.html");
  browser.tabs.create({ url: optionsUrl });
};

// document.addEventListener("keydown", (event) => {
//   if (!isReceivingFormInput) {
//     if (event.keyCode >= 48 && event.keyCode <= 90 && event.target.tagName) {
//       if (
//         event.target.tagName.toUpperCase() === "INPUT" ||
//         event.target.tagName.toUpperCase() === "TEXTAREA" ||
//         event.target.tagName.toUpperCase() === "FORM" ||
//         event.target.isContentEditable === true ||
//         event.target.type === "application/pdf"
//       ) {
//         isReceivingFormInput = true;
//       }
//     }
//   }
// });

const getSuspendOptionInfo = () => {
  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    browser.runtime.sendMessage(
      {
        action: actions.GET_SUSPEND_INFO,
        activeTab: tabs[0].id,
      },
      (response) => {
        console.log(response);
        tabSuspendOption.checked = response.tabState.neverSuspendTab;
        urlSuspendOption.checked = response.tabState.neverSuspendUrl;
        domainSuspendOption.checked = response.tabState.neverSuspendDomain;
      }
    );
  });
};

// Main function
(() => {
  Object.entries(durations).forEach(([key, value]) => {
    var option = document.createElement("option");
    option.text = key;
    option.value = value;
    durationList.appendChild(option);
  });

  // Set durationList value to value from local storage
  browser.storage.local.get("preferences", (items) => {
    console.log(items);
    durationList.value = items.preferences.suspendDuration;
  });

  browser.storage.local.get("actions", (items) => {
    actions = items.actions;
  });

  getSuspendOptionInfo();
})();
