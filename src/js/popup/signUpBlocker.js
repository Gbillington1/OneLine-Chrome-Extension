import { forwardRequest } from "../utils/global";
import $ from 'jquery';

$(document).ready(() => {
    $("#connectAccBtn").click((e) => {
        forwardRequest({ "connectAccBtnClicked": true })
    })
})
