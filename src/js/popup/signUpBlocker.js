import { forwardRequest } from "../utils/global";
import { setupUniqueThankyouLink } from "../utils/sw";
import $ from 'jquery';

$(document).ready(() => {
    $("#connectAccBtn").click((e) => {
        forwardRequest({ "connectAccBtnClicked": true })
    })

    $("#signUpBtn").click(() => {
        const thankyouLink = setupUniqueThankyouLink()
        forwardRequest({ "signUpBtnClicked": true, "next": thankyouLink })
    })
    $("#loginBtn").click(() => {
        const thankyouLink = setupUniqueThankyouLink()
        forwardRequest({ "loginBtnClicked": true, "next": thankyouLink })
    })
})
