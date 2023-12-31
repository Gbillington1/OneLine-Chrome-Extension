/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/js/utils/globalUtils.js":
/*!*************************************!*\
  !*** ./src/js/utils/globalUtils.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   forwardRequest: () => (/* binding */ forwardRequest),
/* harmony export */   getValueFromStorage: () => (/* binding */ getValueFromStorage),
/* harmony export */   sendMsgToCS: () => (/* binding */ sendMsgToCS)
/* harmony export */ });
/**
 * Function to send a message to the content script in a specific tab.
 * @param message message to send to the CS script: message = { myKey: myValue }
 * @param id optional id of the tab to send the message to
 * @returns {Promise<unknown>} response from CS to the message, or error message
 */
async function sendMsgToCS(message, id = undefined) {
    if (id === undefined) {
        const tab = await getCurrentTab();
        id = tab.id;
    }
    return new Promise((resolve,reject) => {
        chrome.tabs.sendMessage(id, message, function (response) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        })
    })
}

/**
 * Helper function for {@link sendMsgToCS} that gets the current tab that the user is on
 * @returns {Promise<unknown>} current tab or error message
 */
function getCurrentTab() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(tabs[0]);
            }
        });
    });
}

/**
 * Forwards a message from a content script or popup script to the background script
 * @param message message to send to the background: message = { myKey: myValue }
 * @returns {Promise<unknown>} response to the message or error msg
 */
function forwardRequest(message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(response);
            }
        })
    })
}

/**
 * Fetches the value of a specified key from the Chrome Sync storage
 * @param key the key to get from storage
 * @returns {Promise<unknown>} the value of the key in storage or error message
 */
async function getValueFromStorage(key) {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get([key], (data) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(data[key]);
            }
        })
    })
}

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*********************************!*\
  !*** ./src/js/background/sw.js ***!
  \*********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _utils_globalUtils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/globalUtils */ "./src/js/utils/globalUtils.js");


// load default states to storage 
chrome.runtime.onInstalled.addListener(function (details) {

    // get the swtich state, set it to true if it's not set, tell CS to start oneline
    chrome.storage.sync.get("onOffSwitchState", function (result) {
        let onOffSwitchState = result.onOffSwitchState;

        if (onOffSwitchState == undefined) {
            chrome.storage.sync.set({ "onOffSwitchState": true }, function () {
                (0,_utils_globalUtils__WEBPACK_IMPORTED_MODULE_0__.sendMsgToCS)({ onOffSwitchState: true }).catch((err) => { console.error(err) })
            });
        }
    })

    // get the active color, set it to default if there isn't one in storage, tell CS to change the color
    chrome.storage.sync.get("activeColor", function (result) {
        let activeColor = result.activeColor;

        if (activeColor == undefined) {
            activeColor = "#f8fd89";
            chrome.storage.sync.set({ "activeColor": activeColor }, function () {
                (0,_utils_globalUtils__WEBPACK_IMPORTED_MODULE_0__.sendMsgToCS)({ activeColor: activeColor }).catch((err) => { console.error(err) })
            });
        }
    })

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
})

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    // fetch user from flask app, null if not authenticated
    if (msg.getUser) {
        fetch('http://127.0.0.1:5000/userinfo').then(res => res.json()).then(data => {
            if (data.user) {
                console.log(data.user)
                // chrome.storage.sync.set({ "user": data.user })
            } else {
                console.log("no user")
                // chrome.storage.sync.set({ "user": null })
                // user needs to log in to use app
            }
        })
    }

    // load pdf reader
    if (msg.pdf) {
        // TODO: Update to prod URL
        chrome.tabs.create({ url: `http://127.0.0.1:5000/view_pdf?file=${encodeURIComponent(msg.pdf)}` })
        sendResponse({ openPDF: true, status: 200 })
    }

    if (msg.signUp) {
        chrome.tabs.create({ url: "https://useoneline.com/newsletter/signup?source=pdf" })
        sendResponse({ signUp: true, status: 200 })
    }

    if (msg.popupEmailList) {
        chrome.tabs.create({ url: "https://useoneline.com/newsletter/signup?source=popup" })
        sendResponse({ popupEmailList: true, status: 200 })
    }

    // reload all pages
    if (msg.reload) {
        chrome.tabs.query({ status: 'complete' }, (tabs) => {
            tabs.forEach((tab) => {
                if (tab.url) {
                    chrome.tabs.update(tab.id, { url: tab.url });
                }
            });
        });
        sendResponse({ reload: true, status: 200 })
    }

})

// Tab change: Fire when tab changes, make sure to wait for content script to load before sending message
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    let tab = await chrome.tabs.get(activeInfo.tabId)
    // this fires when the user goes to a tab that was already loaded
    if (tab.url) {
        (0,_utils_globalUtils__WEBPACK_IMPORTED_MODULE_0__.sendMsgToCS)({ tabChanged: true }, activeInfo.tabId).catch(err => console.error(err))
    // this fires when the user goes to a tab that hasn't been loaded yet (no URL set on tab)
    } else {
        // wait for content script to send loaded message
        chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
            if (msg.pageLoaded === true) {
                (0,_utils_globalUtils__WEBPACK_IMPORTED_MODULE_0__.sendMsgToCS)({ tabChanged: true }, activeInfo.tabId).catch(err => {
                        console.error(err)
                    })
                sendResponse({ pageLoaded: true, status: 200 })
            }
        })
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {

    if (changeInfo.status == "complete" && tab.url) {

        // check if we're on the thank you page => show the reload popup
        chrome.storage.local.get("thankyouTabId", function (data) {
            if (data.thankyouTabId == tabId) {
                fetch(chrome.runtime.getURL('dist/html/blobs/pageReloadPrompt.html')).then(data => data.text()).then(html => {

                    chrome.scripting.insertCSS({
                        target: { tabId: tab.id },
                        files: ['dist/css/tailwind/out.css']
                    })
                    ;(0,_utils_globalUtils__WEBPACK_IMPORTED_MODULE_0__.sendMsgToCS)({ "installPopup": html }, tab.id).catch((err) => { console.error(err) })
                    chrome.storage.local.set({ "thankyouTabId": null }) // make sure we don't fire this popup again
                });

            }
        })

        // TODO: Update to prod URL
        if (!tab.url.includes('127.0.0.1:5000/view_pdf?file=') && tab.url.endsWith('.pdf')) {
            fetch(chrome.runtime.getURL('dist/html/blobs/openPDFInOneLinePopup.html')).then(data => data.text()).then(html => {
                chrome.scripting.insertCSS({
                    target: { tabId: tab.id },
                    files: ['dist/css/tailwind/out.css']
                })
                ;(0,_utils_globalUtils__WEBPACK_IMPORTED_MODULE_0__.sendMsgToCS)({ openPDFPopupHtml: html }, tab.id).catch((err) => { console.error(err) })
            });
        }

        // TODO: Handle modern web apps that don't reload the page when new content is loaded (think nextJS & react apps)
        // The issue is that the highlighted content gets lost when new content is loaded, and the line needs to be refreshed to highlight the start of the new content (issue stems from the fact that most code runs when page loads, but new webapps seldom reload page)
        // This should be able to be fixed with a MutationObserver object, listening for changes in the dom, at every change (or some other condition), search the page for more paragraphs and add them into the paragraphs array (will be a tough one to figure out as you have to maintain order of the paragraphs in the array)

    }
});
})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianMvYmFja2dyb3VuZC5idW5kbGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQSxnRUFBZ0U7QUFDaEU7QUFDQSxhQUFhLGtCQUFrQjtBQUMvQjtBQUNPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDs7QUFFQTtBQUNBLHdCQUF3QixtQkFBbUI7QUFDM0MsYUFBYSxrQkFBa0I7QUFDL0I7QUFDQTtBQUNBO0FBQ0EsNEJBQTRCLG1DQUFtQztBQUMvRDtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQSxpRUFBaUU7QUFDakUsYUFBYSxrQkFBa0I7QUFDL0I7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQSxTQUFTO0FBQ1QsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGFBQWEsa0JBQWtCO0FBQy9CO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0EsU0FBUztBQUNULEtBQUs7QUFDTDs7Ozs7O1VDdEVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7QUNObUQ7O0FBRW5EO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0NBQXNDLDBCQUEwQjtBQUNoRSxnQkFBZ0IsK0RBQVcsR0FBRyx3QkFBd0IsbUJBQW1CLG9CQUFvQjtBQUM3RixhQUFhO0FBQ2I7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0Esc0NBQXNDLDRCQUE0QjtBQUNsRSxnQkFBZ0IsK0RBQVcsR0FBRywwQkFBMEIsbUJBQW1CLG9CQUFvQjtBQUMvRixhQUFhO0FBQ2I7QUFDQSxLQUFLOztBQUVMO0FBQ0EsNkJBQTZCLHVEQUF1RDtBQUNwRjtBQUNBO0FBQ0EsdUNBQXVDLHlCQUF5QjtBQUNoRSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLGdDQUFnQywwQ0FBMEM7QUFDMUU7QUFDQSxDQUFDOztBQUVEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2Q0FBNkMsbUJBQW1CO0FBQ2hFLGNBQWM7QUFDZDtBQUNBLDZDQUE2QyxjQUFjO0FBQzNEO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLDRDQUE0Qyw0QkFBNEIsR0FBRztBQUN4Ryx1QkFBdUIsNEJBQTRCO0FBQ25EOztBQUVBO0FBQ0EsNkJBQTZCLDREQUE0RDtBQUN6Rix1QkFBdUIsMkJBQTJCO0FBQ2xEOztBQUVBO0FBQ0EsNkJBQTZCLDhEQUE4RDtBQUMzRix1QkFBdUIsbUNBQW1DO0FBQzFEOztBQUVBO0FBQ0E7QUFDQSw0QkFBNEIsb0JBQW9CO0FBQ2hEO0FBQ0E7QUFDQSxpREFBaUQsY0FBYztBQUMvRDtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1QsdUJBQXVCLDJCQUEyQjtBQUNsRDs7QUFFQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLCtEQUFXLEdBQUcsa0JBQWtCO0FBQ3hDO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQiwrREFBVyxHQUFHLGtCQUFrQjtBQUNoRDtBQUNBLHFCQUFxQjtBQUNyQiwrQkFBK0IsK0JBQStCO0FBQzlEO0FBQ0EsU0FBUztBQUNUO0FBQ0EsQ0FBQzs7QUFFRDs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGtDQUFrQyxlQUFlO0FBQ2pEO0FBQ0EscUJBQXFCO0FBQ3JCLG9CQUFvQixnRUFBVyxHQUFHLHNCQUFzQiwyQkFBMkIsb0JBQW9CO0FBQ3ZHLCtDQUErQyx1QkFBdUI7QUFDdEUsaUJBQWlCOztBQUVqQjtBQUNBLFNBQVM7O0FBRVQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEIsZUFBZTtBQUM3QztBQUNBLGlCQUFpQjtBQUNqQixnQkFBZ0IsZ0VBQVcsR0FBRyx3QkFBd0IsMkJBQTJCLG9CQUFvQjtBQUNyRyxhQUFhO0FBQ2I7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsQ0FBQyxFIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vT25lTGluZS1DaHJvbWUtRXh0ZW5zaW9uLy4vc3JjL2pzL3V0aWxzL2dsb2JhbFV0aWxzLmpzIiwid2VicGFjazovL09uZUxpbmUtQ2hyb21lLUV4dGVuc2lvbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9PbmVMaW5lLUNocm9tZS1FeHRlbnNpb24vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL09uZUxpbmUtQ2hyb21lLUV4dGVuc2lvbi93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL09uZUxpbmUtQ2hyb21lLUV4dGVuc2lvbi93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL09uZUxpbmUtQ2hyb21lLUV4dGVuc2lvbi8uL3NyYy9qcy9iYWNrZ3JvdW5kL3N3LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogRnVuY3Rpb24gdG8gc2VuZCBhIG1lc3NhZ2UgdG8gdGhlIGNvbnRlbnQgc2NyaXB0IGluIGEgc3BlY2lmaWMgdGFiLlxuICogQHBhcmFtIG1lc3NhZ2UgbWVzc2FnZSB0byBzZW5kIHRvIHRoZSBDUyBzY3JpcHQ6IG1lc3NhZ2UgPSB7IG15S2V5OiBteVZhbHVlIH1cbiAqIEBwYXJhbSBpZCBvcHRpb25hbCBpZCBvZiB0aGUgdGFiIHRvIHNlbmQgdGhlIG1lc3NhZ2UgdG9cbiAqIEByZXR1cm5zIHtQcm9taXNlPHVua25vd24+fSByZXNwb25zZSBmcm9tIENTIHRvIHRoZSBtZXNzYWdlLCBvciBlcnJvciBtZXNzYWdlXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kTXNnVG9DUyhtZXNzYWdlLCBpZCA9IHVuZGVmaW5lZCkge1xuICAgIGlmIChpZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IHRhYiA9IGF3YWl0IGdldEN1cnJlbnRUYWIoKTtcbiAgICAgICAgaWQgPSB0YWIuaWQ7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSxyZWplY3QpID0+IHtcbiAgICAgICAgY2hyb21lLnRhYnMuc2VuZE1lc3NhZ2UoaWQsIG1lc3NhZ2UsIGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgaWYgKGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcikge1xuICAgICAgICAgICAgICAgIHJlamVjdChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9KVxufVxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiBmb3Ige0BsaW5rIHNlbmRNc2dUb0NTfSB0aGF0IGdldHMgdGhlIGN1cnJlbnQgdGFiIHRoYXQgdGhlIHVzZXIgaXMgb25cbiAqIEByZXR1cm5zIHtQcm9taXNlPHVua25vd24+fSBjdXJyZW50IHRhYiBvciBlcnJvciBtZXNzYWdlXG4gKi9cbmZ1bmN0aW9uIGdldEN1cnJlbnRUYWIoKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoeyBhY3RpdmU6IHRydWUsIGN1cnJlbnRXaW5kb3c6IHRydWUgfSwgZnVuY3Rpb24gKHRhYnMpIHtcbiAgICAgICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh0YWJzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogRm9yd2FyZHMgYSBtZXNzYWdlIGZyb20gYSBjb250ZW50IHNjcmlwdCBvciBwb3B1cCBzY3JpcHQgdG8gdGhlIGJhY2tncm91bmQgc2NyaXB0XG4gKiBAcGFyYW0gbWVzc2FnZSBtZXNzYWdlIHRvIHNlbmQgdG8gdGhlIGJhY2tncm91bmQ6IG1lc3NhZ2UgPSB7IG15S2V5OiBteVZhbHVlIH1cbiAqIEByZXR1cm5zIHtQcm9taXNlPHVua25vd24+fSByZXNwb25zZSB0byB0aGUgbWVzc2FnZSBvciBlcnJvciBtc2dcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZvcndhcmRSZXF1ZXN0KG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjaHJvbWUucnVudGltZS5zZW5kTWVzc2FnZShtZXNzYWdlLCAocmVzcG9uc2UpID0+IHtcbiAgICAgICAgICAgIGlmIChjaHJvbWUucnVudGltZS5sYXN0RXJyb3IpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNwb25zZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfSlcbn1cblxuLyoqXG4gKiBGZXRjaGVzIHRoZSB2YWx1ZSBvZiBhIHNwZWNpZmllZCBrZXkgZnJvbSB0aGUgQ2hyb21lIFN5bmMgc3RvcmFnZVxuICogQHBhcmFtIGtleSB0aGUga2V5IHRvIGdldCBmcm9tIHN0b3JhZ2VcbiAqIEByZXR1cm5zIHtQcm9taXNlPHVua25vd24+fSB0aGUgdmFsdWUgb2YgdGhlIGtleSBpbiBzdG9yYWdlIG9yIGVycm9yIG1lc3NhZ2VcbiAqL1xuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFZhbHVlRnJvbVN0b3JhZ2Uoa2V5KSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoW2tleV0sIChkYXRhKSA9PiB7XG4gICAgICAgICAgICBpZiAoY2hyb21lLnJ1bnRpbWUubGFzdEVycm9yKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGNocm9tZS5ydW50aW1lLmxhc3RFcnJvcik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoZGF0YVtrZXldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9KVxufSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgc2VuZE1zZ1RvQ1MgfSBmcm9tIFwiLi4vdXRpbHMvZ2xvYmFsVXRpbHNcIjtcblxuLy8gbG9hZCBkZWZhdWx0IHN0YXRlcyB0byBzdG9yYWdlIFxuY2hyb21lLnJ1bnRpbWUub25JbnN0YWxsZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKGRldGFpbHMpIHtcblxuICAgIC8vIGdldCB0aGUgc3d0aWNoIHN0YXRlLCBzZXQgaXQgdG8gdHJ1ZSBpZiBpdCdzIG5vdCBzZXQsIHRlbGwgQ1MgdG8gc3RhcnQgb25lbGluZVxuICAgIGNocm9tZS5zdG9yYWdlLnN5bmMuZ2V0KFwib25PZmZTd2l0Y2hTdGF0ZVwiLCBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgIGxldCBvbk9mZlN3aXRjaFN0YXRlID0gcmVzdWx0Lm9uT2ZmU3dpdGNoU3RhdGU7XG5cbiAgICAgICAgaWYgKG9uT2ZmU3dpdGNoU3RhdGUgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCh7IFwib25PZmZTd2l0Y2hTdGF0ZVwiOiB0cnVlIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZW5kTXNnVG9DUyh7IG9uT2ZmU3dpdGNoU3RhdGU6IHRydWUgfSkuY2F0Y2goKGVycikgPT4geyBjb25zb2xlLmVycm9yKGVycikgfSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSlcblxuICAgIC8vIGdldCB0aGUgYWN0aXZlIGNvbG9yLCBzZXQgaXQgdG8gZGVmYXVsdCBpZiB0aGVyZSBpc24ndCBvbmUgaW4gc3RvcmFnZSwgdGVsbCBDUyB0byBjaGFuZ2UgdGhlIGNvbG9yXG4gICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5nZXQoXCJhY3RpdmVDb2xvclwiLCBmdW5jdGlvbiAocmVzdWx0KSB7XG4gICAgICAgIGxldCBhY3RpdmVDb2xvciA9IHJlc3VsdC5hY3RpdmVDb2xvcjtcblxuICAgICAgICBpZiAoYWN0aXZlQ29sb3IgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBhY3RpdmVDb2xvciA9IFwiI2Y4ZmQ4OVwiO1xuICAgICAgICAgICAgY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoeyBcImFjdGl2ZUNvbG9yXCI6IGFjdGl2ZUNvbG9yIH0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBzZW5kTXNnVG9DUyh7IGFjdGl2ZUNvbG9yOiBhY3RpdmVDb2xvciB9KS5jYXRjaCgoZXJyKSA9PiB7IGNvbnNvbGUuZXJyb3IoZXJyKSB9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KVxuXG4gICAgaWYgKGRldGFpbHMucmVhc29uID09IFwiaW5zdGFsbFwiKSB7XG4gICAgICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybDogXCJodHRwczovL3VzZW9uZWxpbmUuY29tL3RoYW5reW91L1wiLCBhY3RpdmU6IHRydWUgfSwgZnVuY3Rpb24gKHRhYikge1xuICAgICAgICAgICAgLy8gc2F2ZSB0aGlzIHNwZWNpZmljIElEIHNvIHdlIGNhbiBkZXRlY3QgaW4gaW4gdGhlIG9uVXBkYXRlZCBsaXN0ZW5lclxuICAgICAgICAgICAgLy8gYXZvaWRzIGZpcmluZyB0aGUgb25VcGRhdGVkIGxpc3RlbmVyIHdoZW4gdGhlIHVzZXIgZ29lcyB0byB0aGFuayB5b3Ugb24gdGhlaXIgb3duIChJRCB3aWxsIGJlIGRpZmZlcmVudClcbiAgICAgICAgICAgIGNocm9tZS5zdG9yYWdlLmxvY2FsLnNldCh7IFwidGhhbmt5b3VUYWJJZFwiOiB0YWIuaWQgfSlcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGVsc2UgaWYgKGRldGFpbHMucmVhc29uID09IFwidXBkYXRlXCIpIHtcbiAgICAvLyAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsOiBcImh0dHBzOi8vdXNlb25lbGluZS5jb20vdXBkYXRlcy92MlwiIH0pXG4gICAgLy8gfVxufSlcblxuY2hyb21lLnJ1bnRpbWUub25NZXNzYWdlLmFkZExpc3RlbmVyKChtc2csIHNlbmRlciwgc2VuZFJlc3BvbnNlKSA9PiB7XG5cbiAgICAvLyBmZXRjaCB1c2VyIGZyb20gZmxhc2sgYXBwLCBudWxsIGlmIG5vdCBhdXRoZW50aWNhdGVkXG4gICAgaWYgKG1zZy5nZXRVc2VyKSB7XG4gICAgICAgIGZldGNoKCdodHRwOi8vMTI3LjAuMC4xOjUwMDAvdXNlcmluZm8nKS50aGVuKHJlcyA9PiByZXMuanNvbigpKS50aGVuKGRhdGEgPT4ge1xuICAgICAgICAgICAgaWYgKGRhdGEudXNlcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEudXNlcilcbiAgICAgICAgICAgICAgICAvLyBjaHJvbWUuc3RvcmFnZS5zeW5jLnNldCh7IFwidXNlclwiOiBkYXRhLnVzZXIgfSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJubyB1c2VyXCIpXG4gICAgICAgICAgICAgICAgLy8gY2hyb21lLnN0b3JhZ2Uuc3luYy5zZXQoeyBcInVzZXJcIjogbnVsbCB9KVxuICAgICAgICAgICAgICAgIC8vIHVzZXIgbmVlZHMgdG8gbG9nIGluIHRvIHVzZSBhcHBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBsb2FkIHBkZiByZWFkZXJcbiAgICBpZiAobXNnLnBkZikge1xuICAgICAgICAvLyBUT0RPOiBVcGRhdGUgdG8gcHJvZCBVUkxcbiAgICAgICAgY2hyb21lLnRhYnMuY3JlYXRlKHsgdXJsOiBgaHR0cDovLzEyNy4wLjAuMTo1MDAwL3ZpZXdfcGRmP2ZpbGU9JHtlbmNvZGVVUklDb21wb25lbnQobXNnLnBkZil9YCB9KVxuICAgICAgICBzZW5kUmVzcG9uc2UoeyBvcGVuUERGOiB0cnVlLCBzdGF0dXM6IDIwMCB9KVxuICAgIH1cblxuICAgIGlmIChtc2cuc2lnblVwKSB7XG4gICAgICAgIGNocm9tZS50YWJzLmNyZWF0ZSh7IHVybDogXCJodHRwczovL3VzZW9uZWxpbmUuY29tL25ld3NsZXR0ZXIvc2lnbnVwP3NvdXJjZT1wZGZcIiB9KVxuICAgICAgICBzZW5kUmVzcG9uc2UoeyBzaWduVXA6IHRydWUsIHN0YXR1czogMjAwIH0pXG4gICAgfVxuXG4gICAgaWYgKG1zZy5wb3B1cEVtYWlsTGlzdCkge1xuICAgICAgICBjaHJvbWUudGFicy5jcmVhdGUoeyB1cmw6IFwiaHR0cHM6Ly91c2VvbmVsaW5lLmNvbS9uZXdzbGV0dGVyL3NpZ251cD9zb3VyY2U9cG9wdXBcIiB9KVxuICAgICAgICBzZW5kUmVzcG9uc2UoeyBwb3B1cEVtYWlsTGlzdDogdHJ1ZSwgc3RhdHVzOiAyMDAgfSlcbiAgICB9XG5cbiAgICAvLyByZWxvYWQgYWxsIHBhZ2VzXG4gICAgaWYgKG1zZy5yZWxvYWQpIHtcbiAgICAgICAgY2hyb21lLnRhYnMucXVlcnkoeyBzdGF0dXM6ICdjb21wbGV0ZScgfSwgKHRhYnMpID0+IHtcbiAgICAgICAgICAgIHRhYnMuZm9yRWFjaCgodGFiKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRhYi51cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2hyb21lLnRhYnMudXBkYXRlKHRhYi5pZCwgeyB1cmw6IHRhYi51cmwgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBzZW5kUmVzcG9uc2UoeyByZWxvYWQ6IHRydWUsIHN0YXR1czogMjAwIH0pXG4gICAgfVxuXG59KVxuXG4vLyBUYWIgY2hhbmdlOiBGaXJlIHdoZW4gdGFiIGNoYW5nZXMsIG1ha2Ugc3VyZSB0byB3YWl0IGZvciBjb250ZW50IHNjcmlwdCB0byBsb2FkIGJlZm9yZSBzZW5kaW5nIG1lc3NhZ2VcbmNocm9tZS50YWJzLm9uQWN0aXZhdGVkLmFkZExpc3RlbmVyKGFzeW5jIChhY3RpdmVJbmZvKSA9PiB7XG4gICAgbGV0IHRhYiA9IGF3YWl0IGNocm9tZS50YWJzLmdldChhY3RpdmVJbmZvLnRhYklkKVxuICAgIC8vIHRoaXMgZmlyZXMgd2hlbiB0aGUgdXNlciBnb2VzIHRvIGEgdGFiIHRoYXQgd2FzIGFscmVhZHkgbG9hZGVkXG4gICAgaWYgKHRhYi51cmwpIHtcbiAgICAgICAgc2VuZE1zZ1RvQ1MoeyB0YWJDaGFuZ2VkOiB0cnVlIH0sIGFjdGl2ZUluZm8udGFiSWQpLmNhdGNoKGVyciA9PiBjb25zb2xlLmVycm9yKGVycikpXG4gICAgLy8gdGhpcyBmaXJlcyB3aGVuIHRoZSB1c2VyIGdvZXMgdG8gYSB0YWIgdGhhdCBoYXNuJ3QgYmVlbiBsb2FkZWQgeWV0IChubyBVUkwgc2V0IG9uIHRhYilcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyB3YWl0IGZvciBjb250ZW50IHNjcmlwdCB0byBzZW5kIGxvYWRlZCBtZXNzYWdlXG4gICAgICAgIGNocm9tZS5ydW50aW1lLm9uTWVzc2FnZS5hZGRMaXN0ZW5lcihhc3luYyAobXNnLCBzZW5kZXIsIHNlbmRSZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgaWYgKG1zZy5wYWdlTG9hZGVkID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgc2VuZE1zZ1RvQ1MoeyB0YWJDaGFuZ2VkOiB0cnVlIH0sIGFjdGl2ZUluZm8udGFiSWQpLmNhdGNoKGVyciA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycilcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBzZW5kUmVzcG9uc2UoeyBwYWdlTG9hZGVkOiB0cnVlLCBzdGF0dXM6IDIwMCB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cbn0pO1xuXG5jaHJvbWUudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIoKHRhYklkLCBjaGFuZ2VJbmZvLCB0YWIpID0+IHtcblxuICAgIGlmIChjaGFuZ2VJbmZvLnN0YXR1cyA9PSBcImNvbXBsZXRlXCIgJiYgdGFiLnVybCkge1xuXG4gICAgICAgIC8vIGNoZWNrIGlmIHdlJ3JlIG9uIHRoZSB0aGFuayB5b3UgcGFnZSA9PiBzaG93IHRoZSByZWxvYWQgcG9wdXBcbiAgICAgICAgY2hyb21lLnN0b3JhZ2UubG9jYWwuZ2V0KFwidGhhbmt5b3VUYWJJZFwiLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgaWYgKGRhdGEudGhhbmt5b3VUYWJJZCA9PSB0YWJJZCkge1xuICAgICAgICAgICAgICAgIGZldGNoKGNocm9tZS5ydW50aW1lLmdldFVSTCgnZGlzdC9odG1sL2Jsb2JzL3BhZ2VSZWxvYWRQcm9tcHQuaHRtbCcpKS50aGVuKGRhdGEgPT4gZGF0YS50ZXh0KCkpLnRoZW4oaHRtbCA9PiB7XG5cbiAgICAgICAgICAgICAgICAgICAgY2hyb21lLnNjcmlwdGluZy5pbnNlcnRDU1Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkOiB0YWIuaWQgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbGVzOiBbJ2Rpc3QvY3NzL3RhaWx3aW5kL291dC5jc3MnXVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBzZW5kTXNnVG9DUyh7IFwiaW5zdGFsbFBvcHVwXCI6IGh0bWwgfSwgdGFiLmlkKS5jYXRjaCgoZXJyKSA9PiB7IGNvbnNvbGUuZXJyb3IoZXJyKSB9KVxuICAgICAgICAgICAgICAgICAgICBjaHJvbWUuc3RvcmFnZS5sb2NhbC5zZXQoeyBcInRoYW5reW91VGFiSWRcIjogbnVsbCB9KSAvLyBtYWtlIHN1cmUgd2UgZG9uJ3QgZmlyZSB0aGlzIHBvcHVwIGFnYWluXG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICAvLyBUT0RPOiBVcGRhdGUgdG8gcHJvZCBVUkxcbiAgICAgICAgaWYgKCF0YWIudXJsLmluY2x1ZGVzKCcxMjcuMC4wLjE6NTAwMC92aWV3X3BkZj9maWxlPScpICYmIHRhYi51cmwuZW5kc1dpdGgoJy5wZGYnKSkge1xuICAgICAgICAgICAgZmV0Y2goY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKCdkaXN0L2h0bWwvYmxvYnMvb3BlblBERkluT25lTGluZVBvcHVwLmh0bWwnKSkudGhlbihkYXRhID0+IGRhdGEudGV4dCgpKS50aGVuKGh0bWwgPT4ge1xuICAgICAgICAgICAgICAgIGNocm9tZS5zY3JpcHRpbmcuaW5zZXJ0Q1NTKHtcbiAgICAgICAgICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkOiB0YWIuaWQgfSxcbiAgICAgICAgICAgICAgICAgICAgZmlsZXM6IFsnZGlzdC9jc3MvdGFpbHdpbmQvb3V0LmNzcyddXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBzZW5kTXNnVG9DUyh7IG9wZW5QREZQb3B1cEh0bWw6IGh0bWwgfSwgdGFiLmlkKS5jYXRjaCgoZXJyKSA9PiB7IGNvbnNvbGUuZXJyb3IoZXJyKSB9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPOiBIYW5kbGUgbW9kZXJuIHdlYiBhcHBzIHRoYXQgZG9uJ3QgcmVsb2FkIHRoZSBwYWdlIHdoZW4gbmV3IGNvbnRlbnQgaXMgbG9hZGVkICh0aGluayBuZXh0SlMgJiByZWFjdCBhcHBzKVxuICAgICAgICAvLyBUaGUgaXNzdWUgaXMgdGhhdCB0aGUgaGlnaGxpZ2h0ZWQgY29udGVudCBnZXRzIGxvc3Qgd2hlbiBuZXcgY29udGVudCBpcyBsb2FkZWQsIGFuZCB0aGUgbGluZSBuZWVkcyB0byBiZSByZWZyZXNoZWQgdG8gaGlnaGxpZ2h0IHRoZSBzdGFydCBvZiB0aGUgbmV3IGNvbnRlbnQgKGlzc3VlIHN0ZW1zIGZyb20gdGhlIGZhY3QgdGhhdCBtb3N0IGNvZGUgcnVucyB3aGVuIHBhZ2UgbG9hZHMsIGJ1dCBuZXcgd2ViYXBwcyBzZWxkb20gcmVsb2FkIHBhZ2UpXG4gICAgICAgIC8vIFRoaXMgc2hvdWxkIGJlIGFibGUgdG8gYmUgZml4ZWQgd2l0aCBhIE11dGF0aW9uT2JzZXJ2ZXIgb2JqZWN0LCBsaXN0ZW5pbmcgZm9yIGNoYW5nZXMgaW4gdGhlIGRvbSwgYXQgZXZlcnkgY2hhbmdlIChvciBzb21lIG90aGVyIGNvbmRpdGlvbiksIHNlYXJjaCB0aGUgcGFnZSBmb3IgbW9yZSBwYXJhZ3JhcGhzIGFuZCBhZGQgdGhlbSBpbnRvIHRoZSBwYXJhZ3JhcGhzIGFycmF5ICh3aWxsIGJlIGEgdG91Z2ggb25lIHRvIGZpZ3VyZSBvdXQgYXMgeW91IGhhdmUgdG8gbWFpbnRhaW4gb3JkZXIgb2YgdGhlIHBhcmFncmFwaHMgaW4gdGhlIGFycmF5KVxuXG4gICAgfVxufSk7Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9