// Standard Google Universal Analytics code
(function (i, s, o, g, r, a, m) {
  i["GoogleAnalyticsObject"] = r;
  (i[r] =
    i[r] ||
    function () {
      (i[r].q = i[r].q || []).push(arguments);
    }),
    (i[r].l = 1 * new Date());
  (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m);
})(
  window,
  document,
  "script",
  "https://www.google-analytics.com/analytics.js",
  "ga"
); // Note: https protocol here

ga("create", "UA-154659029-2", "auto");
ga("set", "checkProtocolTask", function () { }); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
ga("require", "displayfeatures");
ga("send", "pageview", "/OneLineExtensionBackground"); // Specify the virtual path

//function to load swtich value from storage
function loadSwitchVal() {
  let value = new Promise(resolve => {
    chrome.storage.sync.get("highlightedSwitch", function (result) {
      resolve(result.highlightedSwitch);
    });
  });
  return value;
}

//function to load rate from storage
function getRate() {
  let value = new Promise(resolve => {
    chrome.storage.sync.get("rate", function (result) {
      resolve(result.rate);
    });
  });
  return value;
}

// gets voice from storage
function getVoice() {
  return new Promise(resolve => {
      chrome.storage.sync.get('voice', function (result) {
          resolve(result.voice)
      })
  })
}

//load the color picker value
function loadRbgVal() {
  let value = new Promise(resolve => {
    chrome.storage.sync.get("highlightedRgbVal", function (result) {
      resolve(result.highlightedRgbVal);
    });
  });
  return value;
}

//when installed, set var to true
var isInstalled = false;
chrome.runtime.onInstalled.addListener(function (details) {
  isInstalled = true;
  chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {

    // check if values have been set
    // if they haven't => set them

    var switchVal = await loadSwitchVal();
    if (switchVal === undefined) {
      chrome.storage.sync.set({ highlightedSwitch: true });
    }

    var rate = await getRate();
    if (rate === undefined) {
      chrome.storage.sync.set({ rate: 1 });
    }

    // var voice = await getVoice();
    // if (voice == undefined) {
    //   chrome.storage.sync.set({ voice: 'Microsoft David Desktop - English (United States)'})
    // }

    var rgbVal = await loadRbgVal();
    if (rgbVal === undefined) {
      chrome.storage.sync.set({ highlightedRgbVal: "rgb(248, 253, 137)" });
    }
  });

  // redirect to thankyou page on install 
  if ((details.reason == "install")) {
    chrome.tabs.create({
      url: 'https://useoneline.com/thankyou/',
      active: true
    });
    var reload = confirm('For OneLine to work right away, every tab in Chrome must be reloaded. Should OneLine reload all of your tabs for you right now?')
    if (reload) {
      chrome.tabs.query({ status: 'complete' }, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.url) {
            chrome.tabs.update(tab.id, { url: tab.url });
          }
        });
      });
    }
    // redirect to update page on update
  } else if (details.reason == "update") {
    // chrome.tabs.create({
    //   url: 'https://useoneline.com/updates/v1.4/v1.4.2/',
    //   active: true
    // })
  }

  return false;
});

//listen for initiate message (from popup), then send message if isInstalled == true
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.msg == "initiate") {
    if (isInstalled) {
      chrome.runtime.sendMessage({ msg: "Extension installed" });
      isInstalled = false;
    }
  }
});

//listen for tab change
chrome.tabs.onActivated.addListener(function () {
  //send message to content script
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { msg: "tab changed" });
  });
});
