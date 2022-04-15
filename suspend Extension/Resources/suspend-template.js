//  suspend - suspend-template.js
//  Created by Abayomi Ikuru

// Actions
var localActions = {};

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

//TODO: Fix reloading with keys

// browser.webNavigation.onBeforeNavigate.addListener((_) => {
//   console.log("onBeforeNavigate");
//   browser.runtime.sendMessage({
//     action: localActions.actions.UNSUSPEND,
//     activeTab: tabs[0].id,
//   });
// });

const unsuspend = async () => {
  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // update tab
    browser.runtime.sendMessage({
      action: localActions.actions.RELOAD,
      activeTab: tabs[0].id,
    });
  });
};

(async () => {
  // if (sessionStorage.getItem("ssuspender-reloaded") === null) {
  //   sessionStorage.setItem("ssuspender-reloaded", "false");
  //   console.log("reloaded is set for first time");
  // } else {
  //   sessionStorage.getItem("ssuspender-reloaded") === "false"
  //     ? sessionStorage.setItem("ssuspender-reloaded", "true")
  //     : sessionStorage.setItem("ssuspender-reloaded", "false");

  //   console.log(sessionStorage.getItem("ssuspender-reloaded"));
  // }
  // sessionStorage.getItem("ssuspender-reloaded") === "true" && unsuspend();

  localActions = await browser.storage.local.get("actions");

  browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // console.log(actions.GET_SUSPEND_INFO);
    browser.runtime.sendMessage(
      {
        action: localActions.actions.GET_SUSPEND_INFO,
        activeTab: tabs[0].id,
      },
      (suspendInfo) => {
        console.log(suspendInfo);
        // url = suspendInfo.tabState.url;
        suspendedUrl.value = suspendInfo.tabState.url;
        suspendedInfoText.innerHTML = suspendInfo.tabState.title;
        bgImage.style.backgroundImage = `url(${suspendInfo.tabState.imageCapture})`;
        tabTitle.innerHTML = `😴 ${suspendInfo.tabState.title}`;

        if (suspendInfo.tabState.suspended === false) {
          console.log(suspendInfo.tabState.suspended);
          // unsuspend
          unsuspend();
        }
      }
    );
  });
})();
