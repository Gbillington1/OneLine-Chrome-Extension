//get current bool state of switch
var highlightedSwitchVal = $("#highlightedSwitch").is(":checked");
var highlightedRgbVal;

//initiate connection with background page
chrome.runtime.sendMessage({ msg: "initiate" });

//function to load value from storage that was saved in saveVal()
function loadSwitchVal() {
  let value = new Promise(resolve => {
    chrome.storage.sync.get("highlightedSwitch", function(result) {
      resolve(result.highlightedSwitch);
    });
  });
  return value;
}

//load the color picker value
function loadRbgVal() {
  let value = new Promise(resolve => {
    chrome.storage.sync.get("highlightedRgbVal", function(result) {
      resolve(result.highlightedRgbVal);
    });
  });
  return value;
}

//load the favorites 
//favBtn1BG
function loadBtn1Val() {
  let value = new Promise(resolve => {
    chrome.storage.sync.get("favBtn1BG", function(result) {
      resolve(result.favBtn1BG);
    });
  });
  return value;
}

//favBtn2BG
function loadBtn2Val() {
  let value = new Promise(resolve => {
    chrome.storage.sync.get("favBtn2BG", function(result) {
      resolve(result.favBtn2BG);
    });
  });
  return value;
}

//favBtn3BG
function loadBtn3Val() {
  let value = new Promise(resolve => {
    chrome.storage.sync.get("favBtn3BG", function(result) {
      resolve(result.favBtn3BG);
    });
  });
  return value;
}

//favBtn4BG
function loadBtn4Val() {
  let value = new Promise(resolve => {
    chrome.storage.sync.get("favBtn4BG", function(result) {
      resolve(result.favBtn4BG);
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

function getRgb(imgData) {
  var pixelData = imgData;
  console.log(pixelData)
  var R = pixelData[0];
  var G = pixelData[1];
  var B = pixelData[2];
  highlightedRgbVal = "rgb(" + R + ", " + G + ", " + B + ")";
  return highlightedRgbVal;
}

$(document).ready(async function() {
  //load switch value from storage
  var loadedSwitchVal = await loadSwitchVal();
  $("#highlightedSwitch").prop("checked", loadedSwitchVal);
  var msg = JSON.stringify(loadedSwitchVal);

  //load favorites from storage
  var loadedBtn1Val = await loadBtn1Val();
  $("#favBtn1").css("background-color", loadedBtn1Val)
  var loadedBtn2Val = await loadBtn2Val();
  $("#favBtn2").css("background-color", loadedBtn2Val)
  var loadedBtn3Val = await loadBtn3Val();
  $("#favBtn3").css("background-color", loadedBtn3Val)
  var loadedBtn4Val = await loadBtn4Val();
  $("#favBtn4").css("background-color", loadedBtn4Val)


  //save value when it is changed
  $("#highlightedSwitch").change(function() {
    highlightedSwitchVal = $("#highlightedSwitch").is(":checked");
    chrome.storage.sync.set({ highlightedSwitch: highlightedSwitchVal });
    msg = "changed to " + JSON.stringify(highlightedSwitchVal);
    sendMsgToCS(0, msg);
  });
});

//Recommended btns
$("#orangeBtn").click(function() {
  chrome.storage.sync.set({ highlightedRgbVal: "#EDDD6E" });
  sendMsgToCS(0, "RBG changed")
});
$("#peachBtn").click(function() {
  chrome.storage.sync.set({ highlightedRgbVal: "#EDD1B0" });
  sendMsgToCS(0, "RBG changed")
});
$("#yellowBtn").click(function() {
  chrome.storage.sync.set({ highlightedRgbVal: "#F8FD89" });
  sendMsgToCS(0, "RBG changed")
});

//setting line as favorites on click and saving favorites on double click
$("#favBtn1").mousedown(async function(e) {
  switch (e.which) {
    case 1: 
      highlightedRgbVal = await loadBtn1Val()
      chrome.storage.sync.set({ highlightedRgbVal: highlightedRgbVal });
      sendMsgToCS(0, "RBG changed");
      break;
    case 3:
      let favBtn1BG = await loadRbgVal();
      $(this).css("background-color", favBtn1BG)
      chrome.storage.sync.set({ favBtn1BG: favBtn1BG });
      //prevent context menu
      $(this).contextmenu(function(e) {
        e.preventDefault();
      });
      break;
    default: 
      break;
  }
});
$("#favBtn2").mousedown(async function(e) {
  switch (e.which) {
    case 1: 
      highlightedRgbVal = await loadBtn2Val()
      chrome.storage.sync.set({ highlightedRgbVal: highlightedRgbVal });
      sendMsgToCS(0, "RBG changed");
      break;
    case 3:
      let favBtn2BG = await loadRbgVal();
      $(this).css("background-color", favBtn2BG)
      chrome.storage.sync.set({ favBtn2BG: favBtn2BG });
      //prevent context menu
      $(this).contextmenu(function(e) {
        e.preventDefault();
      });
      break;
    default: 
      break;
  }
});
$("#favBtn3").mousedown(async function(e) {
  switch (e.which) {
    case 1: 
      highlightedRgbVal = await loadBtn3Val()
      chrome.storage.sync.set({ highlightedRgbVal: highlightedRgbVal });
      sendMsgToCS(0, "RBG changed");
      break;
    case 3:
      let favBtn3BG = await loadRbgVal();
      $(this).css("background-color", favBtn3BG)
      chrome.storage.sync.set({ favBtn3BG: favBtn3BG });
      //prevent context menu
      $(this).contextmenu(function(e) {
        e.preventDefault();
      });
      break;
    default: 
      break;
  }
});
$("#favBtn4").mousedown(async function(e) {
  switch (e.which) {
    case 1: 
      highlightedRgbVal = await loadBtn4Val()
      chrome.storage.sync.set({ highlightedRgbVal: highlightedRgbVal });
      sendMsgToCS(0, "RBG changed");
      break;
    case 3:
      let favBtn4BG = await loadRbgVal();
      $(this).css("background-color", favBtn4BG)
      chrome.storage.sync.set({ favBtn4BG: favBtn4BG });
      //prevent context menu
      $(this).contextmenu(function(e) {
        e.preventDefault();
      });
      break;
    default: 
      break;
  }
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
      var imgData = ctx.getImageData(x, y, 1, 1).data;
      getRgb(imgData);
      chrome.storage.sync.set({ highlightedRgbVal: highlightedRgbVal });
      sendMsgToCS(0, "RBG changed");
      break;
    default:
      break;
  }
});
