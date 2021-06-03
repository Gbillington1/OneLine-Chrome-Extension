export const getValueFromStorage = async (key) => {
    return new Promise((resolve) => {

        chrome.storage.sync.get([key], (data) => {

            resolve(data.activePage); 

        })

    })
}

export const loadActivePage = async () => {

    getValueFromStorage("activePage").then((activePage) => {

        console.log(activePage)

        if (activePage == "colorSettings.html") {
            window.location.href = "colorSettings.html";
        } else if (activePage == "textToSpeech.html") {
            window.location.href = "textToSpeech.html";
        }

    });

}

export const goToDefaultPage = () => {

    chrome.storage.sync.set({ "activePage": "deafultPopup.html" });
    window.location.href = "defaultPopup.html";

}