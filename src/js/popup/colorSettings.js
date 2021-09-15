import { sendMsgToCS, goToDefaultPage } from './util-functions.js';

$(document).ready(() => {

    $("#backContainer").click(() => {

        goToDefaultPage();

    })

    // create the color picker with iro.js
    var colorPicker = new iro.ColorPicker("#colorPicker", {
        width: 150,
        color: "#ff0",
        borderColor: "#9e9e9e",
        borderWidth: 1,
    });

    // change the color of the line when the user stops interacting with the color picker (similar to mouseUp event) 
    colorPicker.on("input:end", (color) => {

        // update the color in the chrome sync storage
        chrome.storage.sync.set({ "activeColor": color.hexString }, sendMsgToCS("active color changed"));

    });

    // change the color of the active color div in the popup as the user is interacting with the color picker 
    colorPicker.on("color:change", (color) => {
        
        // update the active color element in colorSettings.html
        $("#active-color").css("background-color", color.hexString);
        
    })

});