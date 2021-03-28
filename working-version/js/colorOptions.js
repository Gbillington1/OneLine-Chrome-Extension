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
ga("Popup.set", "checkProtocolTask", function () { }); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
ga("Popup.require", "displayfeatures");

// set the current page to the defaut popup when back button is clicked
$('#backLink').click(function () {
  chrome.storage.sync.set({ currentPage: 'defaultPopup.html' });
})

// universal function to return values from chrome storage
function getVal(value) {
  return new Promise(resolve => {
      chrome.storage.sync.get([value], result => {
          resolve(result[value]);
      })
  })
}

// calc most readable color based on bg color
function colorCalc(bgColor) {
  var r = bgColor[0],
    g = bgColor[1],
    b = bgColor[2];
  var yiq = ((r * 0.299) + (g * 0.587) + (b * 0.114));
  return (yiq >= 127) ? 'black' : 'white';
}
var highlightedRgbVal;

// save rgb to storage 
function saveColor(colorToSave) {
  chrome.storage.sync.set({ highlightedRgbVal: colorToSave });
  $('#active-color').css('background-color', colorToSave);
  var colorRgbArr = colorToSave.replace(/[^\d,.]/g, '').split(',');
  var color = colorCalc(colorRgbArr);
  $('#activeColorHeader').css('color', color);
  sendMsgToCS(0, "RGB changed")
}

// save 'set' attribute to storage
function saveAttr(el, val) {
  el.attr('set', val);
  var key = el[0].id + "set";
  chrome.storage.sync.set({ [key]: val });
}

// get 'set' attribute from storage
function getAttr(id) {
  var key = id + 'set';
  return new Promise(resolve => {
    chrome.storage.sync.get([key], function (result) {
      resolve(result[key])
    });
  });
}

//initiate connection with background page
chrome.runtime.sendMessage({ msg: "initiate" });

//when first isntalled, set switch to true and save that value
chrome.runtime.onMessage.addListener(async function (request, sender, sendResponse) {
  if (request.msg == "Extension installed") {

    // loop through favorites and load them if they have previously been set
    $(".colorBtn").each(async function () {
      var set = await getAttr($(this).attr('id'));

      if (set === undefined) {
        saveAttr($(this), false);
      } else if (set) {
        $(this).attr('set', set);
        var favBtnBg = await getVal($(this).attr('id'))
        $(this).css('background-color', favBtnBg)
      }
    });
  }
});

// function to easily send messages to CS 
function sendMsgToCS(tabNumber, message) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
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

$(document).ready(async function () {
  var rgbValArr;
  var textColor;

  //load favorites from storage
  $(".colorBtn").each(async function () {
    // load btn 'set' attributes and apply them to element
    var btnAttr = await getAttr($(this).attr('id'));
    $(this).attr('set', btnAttr)

    // if button has been set (as a favorite), load that color
    if ($(this).attr('set') == 'true') {
      let favBtnBG = await getVal($(this).attr('id'));
      $(this).css("background-color", favBtnBG);

      // calc what color the eyedropper pic should be
      rgbValArr = favBtnBG.replace(/[^\d,.]/g, '').split(',');
      textColor = colorCalc(rgbValArr);
      if (textColor == 'white') {
        $(this).find('img').attr('src', '../images/eyedropper-w.png')
      } else {
        $(this).find('img').attr('src', '../images/eyedropper-b.png')
      }
    }
  });

  // change the active color and calc color of text
  highlightedRgbVal = await getVal("highlightedRgbVal");
  $('#active-color').css('background-color', highlightedRgbVal)
  rgbValArr = highlightedRgbVal.replace(/[^\d,.]/g, '').split(',');
  textColor = colorCalc(rgbValArr);
  $('#activeColorHeader').css('color', textColor)
});

// Update highlighter when recommended btns are clicked
$(".recommendedBtn").click(function () {
  // save color to storage and update line
  saveColor($(this).css("background-color"))

  //send Google Analytics click event
  ga("Popup.send", {
    hitType: "event",
    eventCategory: "RecommendedBtn",
    eventAction: "click",
    eventLabel: $(this).attr("id")
  })
});

$('.colorBtn').click(function () {
  // save color to storage and update line
  if ($(this).attr('set') == 'true') {
    saveColor($(this).css("background-color"))

    // send GA event 
    ga("Popup.send", {
      hitType: "event",
      eventCategory: "Favorites",
      eventAction: "selectedFavorite",
      eventLabel: highlightedRgbVal
    })
  }

})

// function to check if every value in array is true
function checkIfSet(bool) {
  return bool == 'true';
}

$('#addToFavs').click(function () {
  var isSet = []
  var added = false;
  $('.colorBtn').each(async function () {
    if ($(this).attr('set') == 'false' && added === false) {
      added = true;
      // set the color of the favorite to the current color that is selected (visual)
      let favBtnBG = await getVal("highlightedRgbVal");
      $(this).css("background-color", favBtnBG)
      rgbValArr = favBtnBG.replace(/[^\d,.]/g, '').split(',');
      textColor = colorCalc(rgbValArr);
      if (textColor == 'white') {
        $(this).find('img').attr('src', '../images/eyedropper-w.png')
      } else {
        $(this).find('img').attr('src', '../images/eyedropper-b.png')
      }
      // save the favorite
      var id = $(this).attr('id');
      chrome.storage.sync.set({ [id]: favBtnBG });
      // send GA event
      ga("Popup.send", {
        hitType: "event",
        eventCategory: "Favorites",
        eventAction: "setFavorite",
        eventLabel: favBtnBG
      })
      saveAttr($(this), true);
    }
    // make an array of 'set' values
    isSet.push($(this).attr('set'))
  })
  // if every value in 'isSet' array is true => error message
  if (isSet.every(checkIfSet) == true && isSet.length == 5) {
    $('#favErr').css('color', '#cc0000')
  }
})

// delete favorite that corresponds with the delete button
$('.deleteIcon').click(function () {
  var favToDelete = $(this).attr('favToDelete');
  if ($(favToDelete).attr('set') == 'true') {
    $('#favErr').css('color', '#f6f4f7')
    saveAttr($(favToDelete), false);
    $(favToDelete).css('background-color', '');
    $(favToDelete).find('img').attr('src', '../images/eyedropper-b.png');
  }
})

//color picker
var canvas = document.getElementById("colorPicker");
var ctx = canvas.getContext("2d");

//load picker image
var img = new Image();
img.src = "../images/ColorWheel.png";
window.onload = function () {
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

      // save color to storage and update line
      saveColor(highlightedRgbVal)

      break;
    default:
      break;
  }
});