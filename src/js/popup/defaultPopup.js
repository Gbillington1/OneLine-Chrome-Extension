import { loadActivePage, loadOnOffSwitch, loadAbionicSwitch } from '../utils/popup';
import { sendMsgToCS, forwardRequest } from '../utils/global';
import $ from 'jquery';

loadActivePage();

$(document).ready(() => {

    loadOnOffSwitch();
    loadAbionicSwitch();

    $('#colorSettings').click(() => {

        chrome.storage.sync.set({ "activePage": "colorSettings.html" })
        window.location.href = "colorSettings.html"
    
    })

    $('#emailList').click(() => {
    
        forwardRequest({ popupEmailList: true })
    
    })

    $("#logout").click(() => {
        forwardRequest({ logout: true })
    })

    $('#onOffSwitch').change((e) => {

        const stateOfSwitch = e.currentTarget.checked; 
        chrome.storage.sync.set({ "onOffSwitchState": stateOfSwitch })
        sendMsgToCS({ onOffSwitchState: stateOfSwitch })

    })

    $('#abionicSwitch').change((e) => {

        const stateOfSwitch = e.currentTarget.checked; 
        chrome.storage.sync.set({ "abionicSwitchState": stateOfSwitch })
        sendMsgToCS({ abionicSwitchState: stateOfSwitch })

    })

})