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

/**
 * Fetches the app.useoneline.com API to get Auth0 user data
 * @returns Promise<unknown> Auth0 user data or null
 */
export function fetchUser() {
    return new Promise((resolve, reject) => {
        fetch('http://127.0.0.1:5000/userinfo').then(res => res.json()).then(data => {
            if (data.user) {
                resolve(data.user)
                // chrome.storage.sync.set({ "user": data.user })
            } else {
                resolve(null)
                // chrome.storage.sync.set({ "user": null })
                // user needs to log in to use app
            }
        })
    })

}