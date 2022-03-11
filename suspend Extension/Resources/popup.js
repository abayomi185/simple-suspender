console.log("Hello World!", browser);

const optionsButton = document.getElementById("options-button")

optionsButton.innerHTML = '<img src="images/assets/options-icon2.svg"/>';

var optionsUrl = chrome.extension.getURL('options.html');

optionsButton.onclick = function () {
  console.log("Options button clicked")
  const optionsUrl = browser.extension.getURL('options.html');
  document.tabs.create({ url: optionsUrl })
  console.log("Options button clicked")
}

function handleButtonClick(e) {
  
}
