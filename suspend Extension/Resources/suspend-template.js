//  suspend - suspend-template.js
//  Created by Abayomi Ikuru

// Actions
let actions = {};

// Elements
const suspendedUrl = document.getElementById("suspended-url");
const suspendedInfoText = document.getElementById("suspend-info-text");
const suspendedInfoIcon = document.getElementById("suspend-info-icon");
const bgImage = document.getElementById("bg-image");
let tabTitle = document.getElementsByTagName("title")[0];

// Clickable elements
const mainSection = document.getElementById("main-section");
const refreshButton = document.getElementById("refresh-button");

// Click event on the whole page except the center section
mainSection.addEventListener("click", async function (event) {
  if (event.target !== event.currentTarget) return;
  unsuspend();
});

refreshButton.onclick = async function () {
  unsuspend();
};

// window.addEventListener("beforeunload", async (e) => {});

// let url = "";

const unsuspend = async () => {
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // update tab
    browser.runtime.sendMessage({
      action: "RL",
      activeTab: tabs[0].id,
    });
  });
};

(async () => {
  if (sessionStorage.getItem("ssuspender-reloaded") === null) {
    sessionStorage.setItem("ssuspender-reloaded", "false");
    console.log("reloaded is set for first time");
  } else {
    sessionStorage.getItem("ssuspender-reloaded") === "false"
      ? sessionStorage.setItem("ssuspender-reloaded", "true")
      : sessionStorage.setItem("ssuspender-reloaded", "false");

    console.log(sessionStorage.getItem("ssuspender-reloaded"));
  }
  sessionStorage.getItem("ssuspender-reloaded") === "true" && unsuspend();

  // await browser.storage.local.get("actions", (items) => {
  //   actions = items.actions;
  // });
  // console.log(actions);

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // console.log(actions.GET_SUSPEND_INFO);
    browser.runtime.sendMessage(
      {
        action: "GI",
        activeTab: tabs[0].id,
      },
      (suspendInfo) => {
        // url = suspendInfo.tabState.url;
        suspendedUrl.value = suspendInfo.tabState.url;
        suspendedInfoText.innerHTML = suspendInfo.tabState.title;
        bgImage.style.backgroundImage = `url(${suspendInfo.tabState.imageCapture})`;
        tabTitle.innerHTML = suspendInfo.tabState.title;
        // mainSection.style.backgroundImage = suspendInfo.tabState.imageCapture;
      }
    );
  });
})();
