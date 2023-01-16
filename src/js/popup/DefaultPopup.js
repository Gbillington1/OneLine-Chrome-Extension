import { sendMsgToCS, forwardRequest, loadActivePage, loadOnOffSwitch } from './util-functions.js';

loadActivePage();

$(document).ready(() => {

    loadOnOffSwitch();

    $('#colorSettings').click(() => {

        chrome.storage.sync.set({ "activePage": "colorSettings.html" })
        window.location.href = "colorSettings.html"
    
    })

    $('#emailList').click(() => {
    
        forwardRequest({ popupEmailList: true })
    
    })

    $('#onOffSwitch').change((e) => {

        const stateOfSwitch = e.currentTarget.checked; 
        chrome.storage.sync.set({ "onOffSwitchState": stateOfSwitch })
        sendMsgToCS({ switchState: stateOfSwitch })

    })

})