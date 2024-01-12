import { forwardRequest } from "../utils/global";
import {setupThankyouLink, setupUniqueThankyouLink} from "../utils/sw";
import $ from 'jquery';

$(document).ready(() => {
    $("#connectAccBtn").click((e) => {
        forwardRequest({ "connectAccBtnClicked": true })
    })

    $("#signUpBtn").click(() => {
        const thankyouLink = setupThankyouLink()
        forwardRequest({ "signUpBtnClicked": true, "next": thankyouLink })
    })
    $("#loginBtn").click(() => {
        const thankyouLink = setupThankyouLink()
        forwardRequest({ "loginBtnClicked": true, "next": thankyouLink })
    })
})
