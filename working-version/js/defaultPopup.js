// universal function to return values from chrome storage
function getVal(value) {
    return new Promise(resolve => {
        chrome.storage.sync.get([value], result => {
            resolve(result[value]);
        })
    })
}

// function to easily send messages to CS 
function sendMsgToCS(tabNumber, message) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[tabNumber].id, { msg: message });
    });
  }

$(document).ready(async function () {
    //load switch value from storage
    var onOffSwitchVal = await getVal("highlightedSwitch");
    $("#onOffSwitch").prop("checked", onOffSwitchVal);

    //save on/off switch value when it is changed
    $("#onOffSwitch").change(async function () {
        onOffSwitchVal = $("#onOffSwitch").prop("checked");
        chrome.storage.sync.set({ highlightedSwitch: onOffSwitchVal });

        msg = "highlighter changed to " + JSON.stringify(onOffSwitchVal);
        sendMsgToCS(0, msg);

        // send an switch toggled event to google analytics
        ga("Popup.send", {
            hitType: "event",
            eventCategory: "Switch",
            eventAction: "Toggled",
            eventLabel: msg
        })
    });

// get value of current page
var currentPage = await getVal("currentPage");

// only enter if value isn't undefined
if (currentPage !== undefined) {
    // determine which page to load
    if (currentPage == 'colorOptions.html') {
        window.location.href = 'colorOptions.html';
    } else if (currentPage == 'textToSpeech.html') {
        window.location.href = 'textToSpeech.html'
    }
}

// if "change color" is clicked, navigate to that page and set it as the current page
$("#row1").click(function () {
    chrome.storage.sync.set({ currentPage: 'colorOptions.html' });
    window.location.href = 'colorOptions.html'
})

// if "Text to Speech" is clicked, navigate to that page and set it as the current page
$("#row2").click(function () {
    chrome.storage.sync.set({ currentPage: 'textToSpeech.html' });
    window.location.href = 'textToSpeech.html'
})

$("#buy").click(() => {
    chrome.tabs.create({url: 'index.html'});
})

})

