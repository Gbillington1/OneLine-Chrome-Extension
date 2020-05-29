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

ga("create", "UA-154659029-2", "auto", "Popup"); 
ga("Popup.set", "checkProtocolTask", function () {}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
ga("Popup.require", "displayfeatures");


//get current state of on/off switch
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

// function to easily send messages to CS 
function sendMsgToCS(tabNumber, message) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[tabNumber].id, { msg: message });
  });
}

// returns the color of imgData in rgb form (for css)
function getRgb(imgData) {
  var pixelData = imgData;
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

  //load favorites from storage
  $(".colorBtn").each(async function() {
    let favBtnBG = await loadBtn($(this).attr('id'));
    $(this).css("background-color", favBtnBG);
  });

  //save on/off switch value when it is changed
  $("#highlightedSwitch").change(function() {
    highlightedSwitchVal = $("#highlightedSwitch").is(":checked");
    chrome.storage.sync.set({ highlightedSwitch: highlightedSwitchVal });

    msg = "changed to " + JSON.stringify(highlightedSwitchVal);
    sendMsgToCS(0, msg);

    // send an switch toggled event to google analytics
    ga("Popup.send", {
      hitType: "event",
      eventCategory: "Switch",
      eventAction: "Toggled",
      eventLabel: msg
    })
  });
});

// Update highlighter when recommended btns are clicked
$(".recommendedBtn").click(function() {
  chrome.storage.sync.set({ highlightedRgbVal: $(this).css("background-color") });
  sendMsgToCS(0, "RBG changed")

  //send Google Analytics click event
  ga("Popup.send", {
    hitType: "event",
    eventCategory: "RecommendedBtn",
    eventAction: "click",
    eventLabel: $(this).attr("id")
  })
});

//set favorite with right click, apply favorite on left click
$(".colorBtn").mousedown(async function(e) {
  switch (e.which) {
    // left click
    case 1: 
      // save value of btn and update the highlighted line
      highlightedRgbVal = await loadBtn($(this).attr("id"));
      chrome.storage.sync.set({ highlightedRgbVal: highlightedRgbVal });
      sendMsgToCS(0, "RBG changed");
      // send GA event 
      ga("Popup.send", {
        hitType: "event",
        eventCategory: "Favorites",
        eventAction: "selectedFavorite",
        eventLabel: highlightedRgbVal
      })
      break;
    // right click
    case 3:
      // set the color of the favorite to the current color that is selected (visual)
      let favBtnBG = await loadRbgVal();
      $(this).css("background-color", favBtnBG)
      // save the favorite
      var id = $(this).attr('id');
      chrome.storage.sync.set({ [id]: favBtnBG });
      //prevent context menu
      $(this).contextmenu(function(e) {
        e.preventDefault();
      });
      // send GA event
      ga("Popup.send", {
        hitType: "event",
        eventCategory: "Favorites",
        eventAction: "setFavorite",
        eventLabel: favBtnBG
      })
      break;
    default: 
      break;
  }
});

//color picker
var canvas = document.getElementById("colorPicker");
var ctx = canvas.getContext("2d");

//load picker image
var img = new Image();
img.src = "ColorWheel.png";
window.onload = function() {
  // draw the picture to the canvas
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
};

//on click => send rbg to content script
$("#colorPicker").mousedown(e => {

  switch (e.which) {
    // left click
    case 1:
      // get the image data of the pixel that was clicked
      var x = Math.floor(e.pageX - $("#colorPicker").offset().left);
      var y = Math.floor(e.pageY - $("#colorPicker").offset().top);
      var imgData = ctx.getImageData(x, y, 1, 1).data;
      // return in RGB form
      getRgb(imgData);
      // save the RGB and update the highlighted line
      chrome.storage.sync.set({ highlightedRgbVal: highlightedRgbVal });
      sendMsgToCS(0, "RBG changed");
      break;
    default:
      break;
  }
});