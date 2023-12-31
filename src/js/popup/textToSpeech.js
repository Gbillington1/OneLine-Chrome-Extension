import { goToDefaultPage } from './../utils/popupUtils'
import $ from 'jquery';

$(document).ready(() => {

    $('#backContainer').click(() => {

        goToDefaultPage();

    })

})