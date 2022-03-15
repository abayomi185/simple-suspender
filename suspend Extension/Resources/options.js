
const text = document.getElementById("text")

const currentTab = await browser.tabs.getCurrent()

text.innerHTML += currentTab


