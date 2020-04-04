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
function loadBtn(key) {
  return new Promise(resolve => {
    chrome.storage.sync.get([key], function(result) {
      resolve(result[key]);
    });
  });
}

//when first isntalled, set switch to true and save that value
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
  if (request.msg == "Extension installed") {
    $("#highlightedSwitch").prop("checked", true);
    //load favorites (if any)
    $(".colorBtn").each(async function() {
      let favBtnBG = await loadBtn($(this).attr('id'));
      $(this).css("background-color", favBtnBG);
    });
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
  var msg = "changed to " + JSON.stringify(loadedSwitchVal);

  //load favorites from storage
  $(".colorBtn").each(async function() {
    let favBtnBG = await loadBtn($(this).attr('id'));
    console.log(favBtnBG)
    $(this).css("background-color", favBtnBG);
    console.log($(this).attr('id'))
  });

  //save value when it is changed
  $("#highlightedSwitch").change(function() {
    highlightedSwitchVal = $("#highlightedSwitch").is(":checked");
    chrome.storage.sync.set({ highlightedSwitch: highlightedSwitchVal });
    msg = "changed to " + JSON.stringify(highlightedSwitchVal);
    sendMsgToCS(0, msg);
  });
});

//Recommended btns
$(".recommendedBtn").click(function() {
  chrome.storage.sync.set({ highlightedRgbVal: $(this).css("background-color") });
  sendMsgToCS(0, "RBG changed")
});

//set favorite with right click, apply favorite on left click
$(".colorBtn").mousedown(async function(e) {
  switch (e.which) {
    case 1: 
      highlightedRgbVal = await loadBtn($(this).attr("id"));
      console.log(highlightedRgbVal);
      chrome.storage.sync.set({ highlightedRgbVal: highlightedRgbVal });
      sendMsgToCS(0, "RBG changed");
      break;
    case 3:
      let favBtnBG = await loadRbgVal();
      $(this).css("background-color", favBtnBG)
      var id = $(this).attr('id');
      chrome.storage.sync.set({ [id]: favBtnBG });
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