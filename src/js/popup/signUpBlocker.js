import { forwardRequest } from "../utils/global";
import $ from 'jquery';

$(document).ready(() => {
    $("#connectAccBtn").click((e) => {
        forwardRequest({ "connectAccBtnClicked": true })
    })

    $("#signUpBtn").click(() => {
        forwardRequest({ "signUpBtnClicked": true })
    })
    $("#loginBtn").click(() => {
        forwardRequest({ "loginBtnClicked": true })
    })
})
