//  suspend - popup.js
//  Created by Abayomi Ikuru

// Assign DOM elements
// Section Page 1
const sectionPage1 = document.getElementById("section-page-1");
const suspendActiveButton = document.getElementById("suspend-active");
const suspendAllButton = document.getElementById("suspend-all");
const unsuspendAllButton = document.getElementById("unsuspend-all");
const optionsButton = document.getElementById("options-button");

// Section Page 2
const sectionPage2 = document.getElementById("section-page-2");
const durationList = document.getElementById("duration-list");
const tabSuspendInput = document.getElementById("tab-suspend-input");
const urlSuspendInput = document.getElementById("url-suspend-input");
const domainSuspendInput = document.getElementById("domain-suspend-input");

// Options
const moreOptionsButton = document.getElementById("more-options-button");

// Suspend Durations
const durations = {
  never: 0,
  "1 min": 1,
  "2 mins": 2,
  "5 mins": 5,
  "10 mins": 10,
  "15 mins": 15,
  "30 mins": 30,
  "1 hour": 60,
  "2 hours": 120,
  "4 hours": 240,
  "6 hours": 360,
  "12 hours": 720,
  "1 day": 1440,
};

// Suspend active button click handler
suspendActiveButton.onclick = async function () {
  const currentTab = await browser.tabs.getCurrent();
  browser.runtime.sendMessage({
    action: "SUSPEND",
    currentTab: currentTab,
  });
};

// Suspend all button click handler
suspendAllButton.onclick = async function () {
  browser.runtime.sendMessage({
    action: "SUSPEND_ALL",
  });
};

// Unsuspend all button click handler
unsuspendAllButton.onclick = async function () {
  browser.runtime.sendMessage({
    action: "UNSUSPEND_ALL",
  });
};

// Onchange call for dropdown list
durationList.onchange = (_) => {
  // Store value in local storage
  browser.storage.local.get("options", (items) => {
    items.options.suspendDuration = durationList.value;
    browser.storage.local.set(items);
  });
};

tabSuspendInput.onchange = (_) => {
  const currentTab = await browser.tabs.getCurrent();
  // Get value
  tabSuspendInput.checked;
  browser.runtime.sendMessage({
    action: "NEVER_SUSPEND_TAB",
    currentTab: currentTab,
  });
};

urlSuspendInput.onchange = (_) => {
  const currentTab = await browser.tabs.getCurrent();
  browser.runtime.sendMessage({
    action: "NEVER_SUSPEND_URL",
    status: urlSuspendInput.checked,
    currentTab: currentTab,
  });
};

domainSuspendInput.onchange = (_) => {
  const currentTab = await browser.tabs.getCurrent();
  browser.runtime.sendMessage({
    action: "NEVER_SUSPEND_DOMAIN",
    status: domainSuspendInput.checked,
    currentTab: currentTab,
  });
};

// More-Options button click handler
moreOptionsButton.onclick = function () {
  const optionsUrl = browser.runtime.getURL("options.html");
  browser.tabs.create({ url: optionsUrl });
};

// Main function
(async () => {
  Object.entries(durations).forEach(([key, value]) => {
    var option = document.createElement("option");
    option.text = key;
    option.value = value;
    durationList.appendChild(option);
  });

  // Set durationList value to value from local storage
  browser.storage.local.get("options", (items) => {
    durationList.value = items.options.suspendDuration;
  });
})();
