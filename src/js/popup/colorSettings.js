import {
    sendMsgToCS,
    getValueFromStorage,
    goToDefaultPage,
    loadFavoritesFromStorage,
    saveFavoritesToStorage,
    calculateWordColorWithYIQ,
    rgba2hex
} from './util-functions.js';


$(document).ready(async () => {

    $("#backContainer").click(() => {

        goToDefaultPage();

    })

    // load active color from storage
    let activeColor = await getValueFromStorage("activeColor");
    $("#active-color").css("background-color", activeColor);

    // create the color picker with iro.js
    let colorPicker = new iro.ColorPicker("#colorPicker", {
        width: 150,
        color: activeColor,
        borderColor: "#9e9e9e",
        borderWidth: 1,
    });

    // load favorites from storage when popup opens
    $(".favoritesColorBtn").each(async (i, elem) => {

        loadFavoritesFromStorage(elem)

    })

    // change the color of the line when the user stops interacting with the color picker (similar to mouseUp event) 
    colorPicker.on("input:end", (color) => {

        // update the color in the chrome sync storage
        chrome.storage.sync.set({ "activeColor": color.hexString }, sendMsgToCS({ activeColor: color.hexString }));
        activeColor = color.hexString;

    });

    // change the color of the active color div in the popup as the user is interacting with the color picker 
    colorPicker.on("color:change", (color) => {

        const activeColorTextColor = calculateWordColorWithYIQ(color.hexString);

        // update the active color element in colorSettings.html
        $("#active-color").css("background-color", color.hexString);
        $("#active-color").css("color", activeColorTextColor);


    })

    // change color of the line when the recommened btns are clicked
    $(".recommendedBtn, .favoritesColorBtn").click(function () {

        activeColor = $(this).css("background-color");
        chrome.storage.sync.set({ "activeColor": activeColor }, sendMsgToCS({ activeColor: rgba2hex(activeColor) }));
        colorPicker.color.set(activeColor);
        $("#active-color").css("background-color", activeColor);

    })

    // handle add to favorites button click
    $("#addToFavs").click(() => {

        saveFavoritesToStorage(activeColor);

    })

    // delete favorites on trash button click
    // separate util function?  
    $(".deleteIcon").click(function () {

        let favToDelete = $(this).siblings(".favoritesColorBtn")[0];
        $(favToDelete).css('background-color', "")
        $(favToDelete).attr("favoriteIsSet", false)
        chrome.storage.sync.set({ [`${$(favToDelete).attr("id")} favIsSet`]: "false" });

    })

});