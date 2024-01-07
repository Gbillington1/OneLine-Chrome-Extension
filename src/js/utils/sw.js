/** Utility functions for js/background/sw.js */
import {forwardRequest, getValueFromLocalStorage, getValueFromStorage, sendMsgToCS} from "./global";

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
 * Handles the flow for each reason in the chrome.runtime.onInstall handler in the background script
 * @param details details object from chrome.runtime.onInstalled
 */
export async function handleReason(details) {
    if (details === undefined) {
        return
    }

    // get user and handle different extension refresh states based on the user status (logged in or not)
    getRefreshedUser().then(user => {
        setupPopup(user)
        if (details.reason === "install") {
            openThankYouPage(user)
        } else if (details.reason === "update") {
            handleOnUpdate()
        } else {
            //other
        }
    })
}

/**
 * Handler for the install detail in {@link handleReason}
 * Fetches user and redirects user to thank you or login depending on user state
 * @returns {Promise<void>} void
 */

/**
 * Sets the action popup for the extension based on the user. This sets which page to open when the extension icon is clicked
 * If the user is null, set the popup to the sign up blocker, if the user is logged in, set to default
 * @param user user obj from local storage, or flask server, or null if not logged in
 */
function setupPopup(user) {
    if (user === null) {
        chrome.action.setPopup({ "popup": "dist/html/signUpBlocker.html" })
    } else {
        chrome.action.setPopup({ "popup": "dist/html/defaultPopup.html" })
        chrome.storage.local.set({"user": user})
    }
}

/**
 * Opens the thank you page in a users browser when they install the extension
 * If the user is null, they are redirected to the sign up page, then the thank you page
 * @param user
 */
function openThankYouPage(user) {
    const thankyouURL = setupUniqueThankyouLink()
    if (user === null) {
        chrome.tabs.create({ url: `${process.env.API_HOST}/signup?next=${encodeURIComponent(thankyouURL)}`, active: true })
    } else {
        chrome.tabs.create({ url: `${thankyouURL}`, active: true })
    }
}

/**
 * Handler for the update detail in {@link handleReason}
 * @returns void
 */
function handleOnUpdate() {
    return
}

/**
 * Fetches the app.useoneline.com API to get Auth0 user data
 * @returns Promise<unknown> Auth0 user data or null
 */
export function fetchUser() {
    return new Promise((resolve, reject) => {
        fetch(`${process.env.API_HOST}/api/get_user`).then(res => res.json()).then(data => {
            if (data.user) {
                resolve(data.user)
            } else {
                resolve(null)
            }
        })
    })
}

/**
 * Loads blob HTML into chrome sync storage and inject CSS for blob into tab with tabID
 * @param blobPath path of HTML blob to be passed into chrome.runtime.getURL()
 * @param tabID tab ID of tab to insert CSS into
 * @param htmlPurpose short string ID representing purpose of HTML (e.g. reloadTabs)
 * @returns {Promise<void>} void
 */
export async function loadHTMLBlob(blobPath, tabID, htmlPurpose) {
    let data = await fetch(chrome.runtime.getURL(blobPath))
    let html = await data.text()

    // load tailwind CSS
    chrome.scripting.insertCSS({
        target: { tabId: tabID },
        files: ['dist/css/tailwind/out.css']
    })

    // save HTML to storage to be loaded by content script
    chrome.storage.sync.set({ "latestHTML": {
            "content": html,
            "purpose": htmlPurpose
        }
    })
}

/**
 * Set up a unique URL for the thank you page using the current date in milliseconds
 * Saves the millis time to local storage to be used in the future to verify that user has navigated to this page
 * @returns {string} unique thank you page URL
 */
export function setupUniqueThankyouLink() {
    const thankyouTimeId = Date.now();
    chrome.storage.local.set({ "thankyouTimeId": thankyouTimeId })
    return `https://useoneline.com/thankyou?time_id=${thankyouTimeId}&auth_success=true`
}

/**
 * Handler for thank you page in chrome.tabs.onUpdated event listener
 * Updates user in storage if auth was successful & inserts HTML into page when unique time IDs are matched
 * @returns {Promise<void>}
 */
export async function handleThankyouVisit(url, tabId) {
    const params = url.searchParams
    const timeId = params.get("time_id")
    const successfulAuth = params.get("auth_success")

    // handle visit straight from install with time_id
    // load HTML to reload tabs
    if (timeId !== null) {
        // check if the time IDs match => show the reload popup & save user to storage
        const data = await chrome.storage.local.get("thankyouTimeId")
        if (data.thankyouTimeId === parseInt(timeId)) {
            chrome.storage.local.set({ "thankyouTimeId": null })
            await loadHTMLBlob('dist/html/blobs/pageReloadPrompt.html', tabId, "reloadTabs")
        }
    }

    // handle visit after successful login to save user and give access to popup
    if (successfulAuth === "true") {
        // get user & save to storage
        const user = await fetchUser();
        if (user !== null) {
            // save user & remove sign up blocker in popup
            chrome.storage.local.set({"user": user })
            chrome.storage.sync.set({"onOffSwitchState": true})
            chrome.action.setPopup({ "popup": "dist/html/defaultPopup.html" });
        } else {
            // show login popup on thankyou?
        }
    }
}

/**
 * Handles the fetch user message in the chrome.runtime.onMessage event listener
 * Fetches user and sends it back to message sender
 * @param sendResponse function from chrome.runtime.onMessage to send response back to message sender
 * @returns {Promise<void>} void
 */
export async function handleFetchUser(sendResponse) {
    let user = await fetchUser();
    chrome.storage.local.set({ "user": user })
    let statusCode = 200;
    if (user === null) {
        statusCode = 404;
    }
    sendResponse({ "user": user, "status": statusCode })
}

/**
 * Fetches a user account, refreshing its access token if necessary
 * First looks in sync storage to get user, if it is not set get user from API endpoint
 * If still no user, return null
 * else return the user
 * @returns {Promise<unknown>} null or user
 */
export async function getRefreshedUser() {
    let user = await getValueFromLocalStorage("user")

    // no user or user expired
    if ((user === undefined || user === null) || Date.now() > user.expires_at) {
        // fetch for user & return
        try {
            user = await fetchUser();
        } catch (err) {
            console.error(err)
            return null
        }
    }
    return user
}

export async function handleTrackEvent(event, sendResponse) {
    const response = await fetch(`${process.env.API_HOST}/api/track`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(event)
    })
    const data = await response.json();
    sendResponse(data)
}