import {sendMsgToCS} from "./globalUtils";

/**
 * Initializes the onOffSwitchState variable in sync storage when the extension is installed
 * Set to true initially (means OneLine starts out of the box)
 */
export function initOnOffSwitchState() {
    // get the swtich state, set it to true if it's not set, tell CS to start oneline
    chrome.storage.sync.get("onOffSwitchState", function (result) {
        let onOffSwitchState = result.onOffSwitchState;

        if (onOffSwitchState == undefined) {
            chrome.storage.sync.set({ "onOffSwitchState": true }).then(
                sendMsgToCS({ onOffSwitchState: true }).catch((err) => { console.error(err) })
            );
        }
    })
}

/**
 * Initializes the active color variable in sync storage. Checks if sync already has a color and sets default if no color
 * Called when the extension is installed
 */
export function initActiveColor() {
    // get the active color, set it to default if there isn't one in storage, tell CS to change the color
    chrome.storage.sync.get("activeColor", function (result) {
        let activeColor = result.activeColor;

        if (activeColor == undefined) {
            activeColor = "#f8fd89";
            chrome.storage.sync.set({ "activeColor": activeColor }, function () {
                sendMsgToCS({ activeColor: activeColor }).catch((err) => { console.error(err) })
            });
        }
    })
}

/**
 * Handles the flow for each reason in the onInstall handler in the background script
 * @param reason string reason representing the type of extension install (regular install, update, etc)
 */
export function handleReason(reason) {
    if (details.reason == "install") {
        chrome.tabs.create({ url: "https://useoneline.com/thankyou/", active: true }, function (tab) {
            // save this specific ID so we can detect in in the onUpdated listener
            // avoids firing the onUpdated listener when the user goes to thank you on their own (ID will be different)
            chrome.storage.local.set({ "thankyouTabId": tab.id })
        });
    }
    // else if (details.reason == "update") {
    //     chrome.tabs.create({ url: "https://useoneline.com/updates/v2" })
    // }
}