import {sendMsgToCS} from "../utils/global";
import {
    initActiveColor,
    initOnOffSwitchState,
    handleReason,
    loadHTMLBlob,
    handleFetchUser,
    handleTrackEvent,
} from "../utils/sw";

// load default states to storage
chrome.runtime.onInstalled.addListener(function (details) {
    initOnOffSwitchState();
    initActiveColor()
    handleReason(details)
})

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    // open login, sign up, or logout page when buttons are clicked in popup
    if (msg.loginBtnClicked) {
        chrome.tabs.create({ url: `${process.env.API_HOST}/auth/login?next=${encodeURIComponent(msg.next)}`, active: true })
        sendResponse({loginBtnClicked: true})
    }

    if (msg.signUpBtnClicked) {
        chrome.tabs.create({ url: `${process.env.API_HOST}/auth/signup?next=${encodeURIComponent(msg.next)}`, active: true })
        sendResponse({signUpBtnClicked: true})
    }

    if (msg.logout) {
        chrome.storage.local.set({ "user": null })
        chrome.action.setPopup({ "popup": "dist/html/signUpBlocker.html" })
        chrome.tabs.create({ url: `${process.env.API_HOST}/auth/logout`})
        sendResponse({logout: true})
    }

    // send api req to flask to track event with mixpanel
    if (msg.trackEvent) {
        handleTrackEvent(msg.trackEvent, sendResponse)
    }

    // fetch user from flask app, null if not authenticated
    if (msg.fetchUser) {
        handleFetchUser(sendResponse)
    }

    // sets the action popup to whatever html page is passed in as the value
    if (msg.setPopup) {
        chrome.action.setPopup({"popup": msg.setPopup})
        sendResponse({setPopup: true})
    }

    // loads HTML into storage to be fetched with loadHTMLFromStorage, loads CSS into page
    // expects injectHTMLBlob = { htmlPath: "dist/html/blob/index.js", htmlPurpose: "test" }
    // htmlPurpose is used in loadHTMLFromStorage
    if (msg.injectHTMLBlob) {
        loadHTMLBlob(msg.injectHTMLBlob.htmlPath, sender.tab.id, msg.injectHTMLBlob.htmlPurpose).then(sendResponse({injectHTMLBlob: true})).catch(err => console.error(err))
    }

    // load pdf reader
    if (msg.pdf) {
        chrome.tabs.create({url: `${process.env.API_HOST}/view_pdf?file=${encodeURIComponent(msg.pdf)}`})
        sendResponse({openPDF: true})
    }

    // reload all pages
    if (msg.reload) {
        chrome.tabs.query({status: 'complete'}, (tabs) => {
            tabs.forEach((tab) => {
                if (tab.url) {
                    chrome.tabs.update(tab.id, {url: tab.url});
                }
            });
        });
        sendResponse({reload: true})
    }

    // send tab change event when page loads initially
    if (msg.pageLoaded === true) {
        sendResponse({ pageLoaded: true })
        sendMsgToCS({ tabChanged: true }).catch(err => {
            console.error(err)
        })
    }

    // allow async calls
    return true
})

// Fires when tab changes
// sends tab change update to content script if page has been loaded
// TODO: This sendMsgToCS function fires when there is no receiving end, needs to be fixed
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId).then(tab => {
        // this fires when the user goes to a tab that was already loaded
        if (tab.url) {
            sendMsgToCS({ tabChanged: true }).catch(err => console.error(err))
        }
    })
    return true
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        const url = new URL(tab.url)

        // if (url.href.includes(`${process.env.API_HOST}/thankyou?`)) {
        //     handleThankyouVisit(url, tab.id)
        // }
        // TODO: Handle modern web apps that don't reload the page when new content is loaded (think nextJS & react apps)
        // The issue is that the highlighted content gets lost when new content is loaded, and the line needs to be refreshed to highlight the start of the new content (issue stems from the fact that most code runs when page loads, but new webapps seldom reload page)
        // This should be able to be fixed with a MutationObserver object, listening for changes in the dom, at every change (or some other condition), search the page for more paragraphs and add them into the paragraphs array (will be a tough one to figure out as you have to maintain order of the paragraphs in the array)
    }
});