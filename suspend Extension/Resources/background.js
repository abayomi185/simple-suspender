let optionsObject = {
  suspendDuration: 30,
};
let tabs = {};
let urls = {};
let domains = {};

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received request: ", request);

  if (request.greeting === "hello") sendResponse({ farewell: "goodbye" });
});

browser.runtime.onInstalled.addListener(() => {
  browser.storage.local.set({
    options: optionsObject,
    state: stateObject,
  });
});

//browser.runtime.onSuspend(() => {
//  browser.storage.local.set(state)
//})
