import { getValueFromStorage, forwardRequest } from "./global";
import $ from "jquery";

/**
 * updates the global css style with the new color
 * @param color string hex value of color
 */
export function updateLineColor(color) {
    document.documentElement.style.setProperty("--oneline-active-color", color);
};

/**
 * Async function that updates the line color & state of OneLine depending on switch value in storage
 * @param onOffSwitchState boolean state of switch
 * @param activeColor hex code of line color
 * @param ol OneLine instance
 * @returns {Promise<*>} current state of switch
 */
export async function handleTabChange(onOffSwitchState, activeColor, ol) {
// returns the current state of the switch so it can be set in the message event listener
    onOffSwitchState = await getValueFromStorage("onOffSwitchState");

    if (onOffSwitchState === true && !location.href.endsWith('.pdf')) {
        activeColor = await getValueFromStorage("activeColor");
        updateLineColor(activeColor);
        ol.start();
    } else if (onOffSwitchState === false) {
        ol.stop();
    }

    return onOffSwitchState; // return current state of switch
}

export async function getRefreshedUser() {
    const user = await getValueFromStorage("user")

    // no user or user expired
    if ((user === undefined || user === null) || Date.now() > user.expires_at) {
        // fetch for user & return
        try {
            const response = await forwardRequest({ "fetchUser": true })
            return response.user
        } catch (err) {
            console.error(err)
            return null
        }
    }
}

/**
 * Inserts reload tabs HTML into page and sets up event listeners
 * Helper function for {@link loadHTMLFromStorage}
 * @param html HTML string of the reload tabs popup
 */
export function setupReloadPopup(html) {
    document.body.insertAdjacentHTML('beforeend', html);
    $('#ol-reload-btn').click(() => forwardRequest({ reload: true }));
    $('#ol-close-btn').click(() => $('#ol-reload-page-prompt').remove());
}

/**
 * Fetches the latest HTML from sync storage & inserts it into the page if it exists
 * @returns {Promise<void>} void
 */
export async function loadHTMLFromStorage() {
    let latestHTML = await getValueFromStorage("latestHTML")
    if (latestHTML !== undefined && latestHTML !== null) {
        if (latestHTML.purpose === "reloadTabs") {
            setupReloadPopup(latestHTML.content)
        } else if (latestHTML.purpose === "openPDF") {
            setupPDFPopup(latestHTML.content)
        } else if (latestHTML.purpose === "unsupportedPage") {
            setupUnsupportedPageAlert(latestHTML.content)
        }

        // make sure to clear after inserting
        chrome.storage.sync.set({"latestHTML": null})
    }
}

/**
 * Inserts PDF popup HTML into page and sets up event listeners
 * Helper function for {@link loadHTMLFromStorage}
 * @param html HTML string of the PDF popup
 */
function setupPDFPopup(html) {
    document.body.insertAdjacentHTML('beforeend', html);
    // forward request to background script to open OneLine PDF Viewer with pdf URL
    $("#ol-openPDF").click(() => forwardRequest({ pdf: window.location.href }))
    // close the coming soon modal
    $("#ol-dismissPDF").click(() => $('#ol-open-pdf-popup').remove())
}

/**
 * Inserts unsupported page alert HTML into page and sets up event listeners
 * Helper function for {@link loadHTMLFromStorage}
 * @param html HTML string of the PDF popup
 */
function setupUnsupportedPageAlert(html) {
    document.body.insertAdjacentHTML('beforeend', html);
    let $alert = $("#ol-unsupported-page-alert")
    $("#ol-thanks-btn").click(() => $alert.remove())
    $("#ol-close-btn").click(() => $alert.remove())
}

