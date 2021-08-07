import { sendMsgToCS, loadActivePage, loadOnOffSwitch } from './util-functions.js';

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

        const stateOfSwitch = e.currentTarget.checked; 
        chrome.storage.sync.set({ "onOffSwitchState": stateOfSwitch })
        sendMsgToCS("on/off switch changed to " + stateOfSwitch);

    })

})