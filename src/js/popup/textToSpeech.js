import { goToDefaultPage } from '../utils/popup'
import $ from 'jquery';

$(document).ready(() => {

    $('#backContainer').click(() => {

        goToDefaultPage();

    })

})