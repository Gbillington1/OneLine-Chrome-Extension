import { goToDefaultPage } from './util-functions.js';

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

})