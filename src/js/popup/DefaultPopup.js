import { loadActivePage, loadOnOffSwitch } from './util-functions.js';

loadActivePage();

$(document).ready(() => {

    loadOnOffSwitch();

    $('#colorSettings').click(() => {

        chrome.storage.sync.set({ "activePage": "colorSettings.html" })
        window.location.href = "colorSettings.html"
    
    })

    $('#tts').click(() => {
    
        chrome.storage.sync.set({ "activePage": "textToSpeech.html" })
        window.location.href = "textToSpeech.html"
    
    })

    $('#onOffSwitch').change((e) => {

        chrome.storage.sync.set({ "onOffSwitchValue": e.currentTarget.checked })

    })

})