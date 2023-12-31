import { getValueFromStorage } from "./global";

/**
 * updates the global css style with the new color
 * @param color string hex value of color
 */
export function updateLineColor(color) {
    document.documentElement.style.setProperty("--oneline-active-color", color);
};

/**
 * Async function that updates the line color & state of OneLine depending on switch value in storage
 * @param onOffSwitchState boolean state of switch
 * @param activeColor hex code of line color
 * @param ol OneLine instance
 * @returns {Promise<*>} current state of switch
 */
export async function handleTabChange(onOffSwitchState, activeColor, ol) {
// returns the current state of the switch so it can be set in the message event listener
    onOffSwitchState = await getValueFromStorage("onOffSwitchState");

    if (onOffSwitchState === true && !location.href.endsWith('.pdf')) {
        activeColor = await getValueFromStorage("activeColor");
        updateLineColor(activeColor);
        ol.start();
    } else if (onOffSwitchState === false) {
        ol.stop();
    }

    return onOffSwitchState; // return current state of switch
}