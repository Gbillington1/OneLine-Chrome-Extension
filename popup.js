//get current bool state of switch
var highlightedSwitchVal = $("#highlightedSwitch").is(":checked");

//initiate connection with background page
chrome.runtime.sendMessage({ msg: "initiate" });

//function to load value from storage that was saved in saveVal()
function loadVal() {
  let value = new Promise(resolve => {
    chrome.storage.sync.get("highlightedSwitch", function(result) {
      resolve(result.highlightedSwitch);
    });
  });
  return value;
}

//when first isntalled, set switch to true and save that value
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.msg == "Extension installed") {
    let onInstallSwitchValue = $("#highlightedSwitch").prop("checked", true);
    $("#highlightedSwitch").prop("checked", onInstallSwitchValue);
    chrome.storage.sync.set({ highlightedSwitch: onInstallSwitchValue });
  }
});

function sendMsgToCS(tabNumber, message) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[tabNumber].id, { msg: message });
  });
}

$(document).ready(async function() {
  //load value from storage
  var loadedSwitchVal = await loadVal();
  $("#highlightedSwitch").prop("checked", loadedSwitchVal);
  var msg = JSON.stringify(loadedSwitchVal);

  //save value when it is changed
  $("#highlightedSwitch").change(function() {
    highlightedSwitchVal = $("#highlightedSwitch").is(":checked");
    chrome.storage.sync.set({ highlightedSwitch: highlightedSwitchVal });
    msg = "changed to " + JSON.stringify(highlightedSwitchVal);
    sendMsgToCS(0, msg);
  });
});

//color picker
//create canvas
var canvas = document.getElementById("colorPicker");
var ctx = canvas.getContext("2d");

//load picker image
var img = new Image();
img.src = "ColorWheel.png";
window.onload = function() {
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
};

//on click => send rbg to content script
$("#colorPicker").mousedown(e => {
  switch (e.which) {
    case 1:
      var x = Math.floor(e.pageX - $("#colorPicker").offset().left);
      var y = Math.floor(e.pageY - $("#colorPicker").offset().top);
    
      var imgData = ctx.getImageData(x, y, 1, 1);
      var pixelData = imgData.data;
      var R = pixelData[0];
      var G = pixelData[1];
      var B = pixelData[2];
      var highlightedRgbVal = "rgb(" + R + ", " + G + ", " + B + ")";
      chrome.storage.sync.set({ highlightedRgbVal: highlightedRgbVal });
      sendMsgToCS(0, "RBG changed");
      break;
    default:
      break;
  }
});
