$(document).ready(function () {
    chrome.identity.getAuthToken({ interactive: true }, function (token) {
        $("#oauth").html(token)
        console.log("Token: " + token)
        chrome.identity.getProfileUserInfo(function (userinfo) {
            console.log(userinfo);
        })
    });
})