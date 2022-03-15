//  suspend - suspend-template.js
//  Created by Abayomi Ikuru

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

const unsuspend = () => {
  // Get query params from the url
  const urlParams = new URLSearchParams(window.location.search);
  const url = urlParams.get("url");
};

(() => {
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
})();
