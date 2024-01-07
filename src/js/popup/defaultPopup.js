import { loadOnOffSwitch, loadAbionicSwitch } from '../utils/popup';
import { sendMsgToCS, forwardRequest } from '../utils/global';
import $ from 'jquery';

$(document).ready(() => {

    loadOnOffSwitch();
    // loadAbionicSwitch();

    $('#colorSettings').click(() => {

        chrome.action.setPopup({"popup": "dist/html/colorSettings.html" })
        window.location.href = "colorSettings.html"
    
    })

    $("#logout").click(() => {
        forwardRequest({ logout: true })
    })

    $('#onOffSwitch').change((e) => {

        const stateOfSwitch = e.currentTarget.checked; 
        chrome.storage.sync.set({ "onOffSwitchState": stateOfSwitch })
        sendMsgToCS({ onOffSwitchState: stateOfSwitch })
        chrome.tabs.query({active: true}, function(tabs) {
            let url = tabs[0].url;
            forwardRequest({ trackEvent: {
                    "name": "master_switch_toggled",
                    "properties": {
                        "switchState": stateOfSwitch,
                        "url": url
                    }
                }
            })
        })

    })

    // $('#abionicSwitch').change((e) => {
    //
    //     const stateOfSwitch = e.currentTarget.checked;
    //     chrome.storage.sync.set({ "abionicSwitchState": stateOfSwitch })
    //     sendMsgToCS({ abionicSwitchState: stateOfSwitch })
    //
    // })

})