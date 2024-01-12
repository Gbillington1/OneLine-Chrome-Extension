import {getValueFromStorage, forwardRequest, getValueFromLocalStorage} from "./global";
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
    let user = await getRefreshedUser();
    if ((user !== null && user.authenticated === true) && onOffSwitchState === true && !location.href.endsWith('.pdf')) {
        activeColor = await getValueFromStorage("activeColor");
        updateLineColor(activeColor);
        ol.start();
    } else if (onOffSwitchState === false || user === null) {
        ol.stop();
    }

    return onOffSwitchState; // return current state of switch
}

/**
 * Look for user in storage, get it from service worker (who will hit the API) to get the user
 * When service worker hits API endpoint, the users access token is refreshed
 * @returns {Promise<*>} user obj or null
 */
export async function getRefreshedUser() {
    let user = await getValueFromLocalStorage("user")

    if (user === undefined) {
        user = null
    }

    // no user or user expired
    if (user === null || Date.now() > user.expires_at) {
        // fetch for user & return
        try {
            const response = await forwardRequest({ "fetchUser": true })
            user = response.user
        } catch (err) {
            console.error(err)
            return null
        }
    }
    return user;
}

/**
 * Based on the state of the user (null, or not null), set the popup html page to be loaded into the extension popup
 * @param user user obj from storage or flask server, or null
 * @returns {object}
 */
export function buildPopupOptions(user) {
    let options = {}
    if (user === null) {
        options.setPopup = "dist/html/signUpBlocker.html"
    } else {
        options.setPopup = "dist/html/defaultPopup.html"
    }
    return options
}

/**
 * Depending on the state of the user, and what page the user is on,
 * create the injectHTMLBlob object with the path and purpose to the html file to load
 * @param user
 * @returns {object} options for {@link forwardRequest}
 */
export async function getBlobOptions(user) {
    let options = {}
    if (user === null) {
        options.injectHTMLBlob = { htmlPurpose: "signUpFor" }
        if (location.href.endsWith('.pdf') && !location.href.includes(`${process.env.API_HOST}/view_pdf?file`)) {
            options.injectHTMLBlob.htmlPath = "dist/html/blobs/signUpForPDF.html"
        } else {
            options.injectHTMLBlob.htmlPath = "dist/html/blobs/signUpForWeb.html"
        }
    } else {
        if (location.href.endsWith('.pdf') && !location.href.includes(`${process.env.API_HOST}/view_pdf?file`)) {
            options.injectHTMLBlob = {
                htmlPath: "dist/html/blobs/openPDFInOneLinePopup.html",
                htmlPurpose: "openPDF"
            }
        } else if (location.href.includes(`${process.env.API_HOST}/thankyou?`)) {
            options.injectHTMLBlob = await getOptionsForThankyouVisit(new URL(location.href))
        }
    }
    return options;
}

/**
 * Builds the injectHTMLBlob option for the page reload prompt if the
 * time ID query param matches the time ID in storage (set on install)
 * @returns Object
 */
export async function getOptionsForThankyouVisit(url) {
    const params = url.searchParams
    const timeId = params.get("time_id")
    let injectHTMLBlob = null;

    if (timeId !== null) {
        const data = await chrome.storage.local.get("thankyouTimeId")
        if (data.thankyouTimeId === parseInt(timeId)) {
            chrome.storage.local.set({ "thankyouTimeId": null })
            injectHTMLBlob = {
                htmlPath: "dist/html/blobs/pageReloadPrompt.html",
                htmlPurpose: "reloadTabs"
            }
        }
    }
    return injectHTMLBlob
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
        } else if (latestHTML.purpose === "signUpFor") {
            setupSignUpForPDFPopup(latestHTML.content)
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
    // avoid adding more than once
    if ($("#ol-open-pdf-popup").length > 0) {
        return
    }

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
    // avoid adding more than once
    if ($("#ol-unsupported-page-alert").length > 0) {
        return
    }

    document.body.insertAdjacentHTML('beforeend', html);
    let $alert = $("#ol-unsupported-page-alert")
    $("#ol-thanks-btn").click(() => $alert.remove())
    $("#ol-close-btn").click(() => $alert.remove())
}

/**
 * Inserts sign up page alert HTML for PDFs into page and sets up event listeners
 * Helper function for {@link loadHTMLFromStorage}
 * @param html HTML string of the PDF popup
 */
function setupSignUpForPDFPopup(html) {
    // avoid adding more than once
    if ($("#ol-sign-up-for").length > 0) {
        return
    }

    // determine next page url
    let nextPage = window.location.href
    if (nextPage.endsWith('.pdf')) {
        nextPage = `${process.env.API_HOST}/view_pdf?file=${encodeURIComponent(window.location.href)}`
    }

    // insert into html and bind listeners
    document.body.insertAdjacentHTML('beforeend', html);
    $("#ol-close-btn").click(() => $("#ol-sign-up-for").remove())
    $("#ol-signUp").click(() => {
        forwardRequest({ "signUpBtnClicked": true, "next": nextPage})
    })
    $("#ol-login").click(() => {
        forwardRequest({ "loginBtnClicked": true, "next": nextPage })
    })
}

