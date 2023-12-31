/**
 * Function to send a message to the content script in a specific tab.
 * @param message message to send to the CS script: message = { myKey: myValue }
 * @param id optional id of the tab to send the message to
 * @returns {Promise<unknown>} response from CS to the message, or error message
 */
export async function sendMsgToCS(message, id = undefined) {
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
 * @returns {Promise<unknown>} reponse to the message or error msg
 */
export function forwardRequest(message) {
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
export async function getValueFromStorage(key) {
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