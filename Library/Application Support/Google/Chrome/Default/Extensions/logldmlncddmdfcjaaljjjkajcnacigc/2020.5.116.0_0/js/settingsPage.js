/**
 * autoApplyContent.js - The script is injected into the active tab in the current browser window, and facilitates communication
 * between the background scripts and the popup scripts.
 */
var DEBUG_SETTINGS_DIALOG = false;

/**
 * This is a global variable container that will store the iframe, injected into the retailer's site. This needs to be kept tracked
 * so the content script is then able to close the iframe upon user request.
 */
var _global_settingsIframes = [];
var _global_settingsCurrentIframe = null;
var _global_mainSettingsIframe = null;

var BfrlTool = chrome.extension.getBackgroundPage().BfrlTool;
var bfPrefs = BfrlTool.Prefs;
var dstool = chrome.extension.getBackgroundPage().DisableSystem;


function _RemoveBlackoutSettingsDiv() {
	var element = document.getElementById("befrugal_settingsBlackoutDiv");
	if (element) {
		document.body.removeChild(element);
		element = null;
	}
}

function _BlackoutSettingsDiv_AddIfMissing() {
	var element = document.getElementById("befrugal_settingsBlackoutDiv");
	if (!element) {
		var blackoutDiv = document.createElement("div");
		blackoutDiv.setAttribute("id", "befrugal_settingsBlackoutDiv");
		blackoutDiv.setAttribute("style", "position: fixed; width: 100%; height:100%; z-index: -1; background: rgba(0, 0, 0, 0.04); top: 0; left: 0; bottom: 0; right: 0;");
		document.body.insertBefore(blackoutDiv, document.body.firstChild);
	}
}

/**
 * Resizes the iframe popup.
 * @param {HTMLIFrameElement} frame
 * @param {Number} frameWidth
 * @param {Number} frameHeight
 */
function _ResizeSettingsPopup(frame, frameWidth, frameHeight, centered, newZIndex) {
	if (!frame) {
		frame = document.getElementById("befrugal_settings");
	}
	if (!newZIndex) {
		newZIndex = 0;
	}

	var top = "25px";
	var left = "25px";
	var centeredAttributes = " ";
	if (centered != null && centered) {
		centeredAttributes =
			"top: 50% !important; " +
			"left: 50% !important; " +
			"right: auto !important; " +
			"bottom: auto !important; " +
			"-ms-transform: translate(-50%, -50%); " +
			"-webkit-transform: translate(-50%, -50%); " +
			"transform: translate(-50%, -50%); ";
	}

	//All attributes must end in !important, because we don't want the retailer site's CSS styles to affect our popup.
	//CSS styles do not support hex values.
	frame.setAttribute("style",
		//This fixes the position of the <iframe> to wherever we specify.
		"position: fixed !important; " +
		//This disables forcing margin spacing at the top, but allows the <iframe> to be positioned left or right.
		"margin: 0 auto !important; " +
		"padding: 0 !important; " +
		//Specifies whether to clip content or add scrollbars when an element's content is too big to fit in a specified area.
		"overflow: auto !important; " +
		"overflow-y: hidden !important; " +
		//This lets us specify a rectangle to clip an absolutely positioned element. We don't want to clip anything, so we set it
		//to be "auto" by default.
		"clip: auto !important; " +

		(centered ? centeredAttributes :
			//Distances from top and from right are all set to a certain number, which sets the <iframe> to be how far in the top right corner.
			"top:" + top + " !important; " +
			"left:" + left + " !important; " +
			//Left and bottom should be auto by default.
			"right: auto !important; " +
			"bottom: auto !important; ") +

		//Border helps to add spacings on the edges without affecting margins.
		"border: 1px solid #333 !important; " +
		//Don't inline the contents, else the layouts will be erratic.
		"display: block !important; " +
		//In 3D world space, the default user's view is orthographic. By making our popup be very close to the camera,
		//we avoid getting blocked by any other objects on the screen.
		"z-index: " + newZIndex + " !important; " +
		//No insets. No gray-ish border on the outside.
		"border-style: none !important; " +
		//We start out from 0.0f, or 0% opaque, and then transition into opacity at 1.0 or at 100%.
		"opacity: 1.0; " +
		"-webkit-transition-delay: 0s !important; " +
		"-moz-transition-delay: 0s !important; " +
		"-o-transition-delay: 0s !important; " +
		"transition-delay: 0s !important; " +
		"-webkit-transition-duration: 0.2s !important; " +
		"-moz-transition-duration: 0.2s !important; " +
		"-o-transition-duration: 0.2s !important; " +
		"transition-duration: 0.2s !important; " +
		"-webkit-transition-property: opacity !important; " +
		"-moz-transition-property: opacity !important; " +
		"-o-transition-property: opacity !important; " +
		"transition-property: opacity !important; " +
		"-webkit-transition-timing-function: ease !important; " +
		"-moz-transition-timing-function: ease !important; " +
		"-o-transition-timing-function: ease !important; " +
		"transition-timing-function: ease !important; " +
		"visibility: visible; " +
		//TODO(Thompson): Do we want left or right facing box shadows?
		//Adding some box shadows to make the <iframe> stand out more.
		"box-shadow: -1px 1px 5px #888 !important; " +

		//Adding width/height.
		"width: " + frameWidth + "px; " +
		"height: " + frameHeight + "px; " +

		//Avoid adding unwanted artifacts to the actual popup.
		"background-color: white; ");

	//Adding these in, so future references will work.
	frame.setAttribute("width", frameWidth);
	frame.setAttribute("height", frameHeight);

	//HTML4
	frame.setAttribute("scrolling", "no");
}

/**
 * Code to inject an <iframe> into the focused webpage. This is the only known way of displaying a popup without user intervention.
 */
function _CreateSettingsPopup(url, frameWidth, frameHeight, centered, optionalId) {
	if (DEBUG_SETTINGS_DIALOG) {
		console.debug("(settingsPage.js) Settings page is disabled.");
		return;
	}

	var newId = optionalId || "befrugal_settings";

	//NOTE(Thompson): Better to recreate the dialog than to overlay a new dialog over (or under) a previous dialog.
	var frame = document.getElementById(newId);
	if (frame) {
		document.body.removeChild(frame);
		frame = null;
	}

	frame = document.createElement("iframe");
	frame.setAttribute("id", newId);

	if (centered)
		_ResizeSettingsPopup(frame, frameWidth, frameHeight, centered, _global_settingsIframes.length);
	else
		_ResizeSettingsPopup(frame, frameWidth, frameHeight, false, _global_settingsIframes.length);

	_BlackoutSettingsDiv_AddIfMissing();

	//Setting the source url.
	frame.setAttribute("src", chrome.runtime.getURL(url));
	document.body.insertBefore(frame, document.body.firstChild);

	//Setting the width/height of the body.
	var iframeDoc = frame.document || frame.contentWindow.document || frame.contentDocument;
	iframeDoc.body.style.width = frameWidth;
	iframeDoc.body.style.height = frameHeight;

	//Workaround for CSS transition property not firing when the page has finished loading. (Animation)
	//Manually sets the opacity from 0.0 to 1.0, in order to show the popup, after 1 elapsed second.
	setTimeout(function () {
		let v = frame.attributes["style"].value;
		v = v.replace("opacity: 0.0", "opacity: 1.0");
		frame.attributes["style"].value = v;
	}, 200);

	return frame;
}

window.addEventListener("DOMContentLoaded", function (event) {


    //Initialize checkbox state(s).
    BfrlTool.BrowserStorage.AllowCashbackInjection.then(function (cbinjection) {
        _global_settingsIframes.push(_CreateSettingsPopup("settings/settings.html", 400, 360, true, "befrugal_settings"));
        _global_mainSettingsIframe = _global_settingsIframes[0];
        _global_settingsCurrentIframe = _global_settingsIframes[_global_settingsIframes.length - 1];
        _global_settingsCurrentIframe.setAttribute("allowscashbackrates", cbinjection);

        _global_settingsCurrentIframe.addEventListener("load", function (event) {
            var iframeDoc = _global_settingsCurrentIframe.contentDocument || _global_settingsCurrentIframe.contentWindow.document;

            _global_settingsCurrentIframe.addEventListener("receiveCustomEvent", function (event) {
                var detail = event.detail;
                if (detail.targetScript == "settingsPage.js") {
                    switch (detail.action) {
                        case "openHideNotificationsDialog": {
                            let newPopup = _CreateSettingsPopup(detail.url, 500, 450, true, "befrugal_hideNotificationsSettings");
                            if (_global_settingsIframes.indexOf(newPopup) < 0) {
                                newPopup.setAttribute("tempsavedlist", _global_mainSettingsIframe.getAttribute("tempsavedlist"));
                                _global_settingsIframes.push(newPopup);
                                _global_settingsCurrentIframe = _global_settingsIframes[_global_settingsIframes.length - 1];
                            }
                            else {
                                _global_settingsCurrentIframe = _global_settingsIframes[_global_settingsIframes.indexOf(newPopup)];
                            }
                            break;
                        }
                        case "saveNewHideNotifyList": {
                            if (_global_settingsIframes.length > 0) {
                                //BfrlTool.Prefs stuffs.
                                //The only time the list is updated is when the user manually removes the sites from the list, or when the user clicks on "Remove All" button.
                                //detail.sites is of type String.
                                BfrlTool.BrowserStorage.TurnOffNotifications = (detail.appliedList ? detail.appliedList : "");


                                _global_mainSettingsIframe.setAttribute("tempsavedlist", detail.appliedList);
                            }
                            break;
                        }
                        case "closeSettings": {
                            if (_global_settingsIframes.length > 0) {
                                _global_settingsCurrentIframe.parentElement.removeChild(_global_settingsCurrentIframe);
                                _global_settingsIframes.pop();
                                _global_settingsCurrentIframe = _global_settingsIframes[_global_settingsIframes.length - 1];
                            }

                            if (_global_settingsIframes.length <= 0) {
                                chrome.tabs.getCurrent((tab) => {
                                    chrome.tabs.remove(tab.id);
                                });
                                window.close();
                            }
                            break;
                        }
                        case "closeSettingsFully": {
                            chrome.tabs.getCurrent((tab) => {
                                chrome.tabs.remove(tab.id);
                            });
                            window.close();
                            break;
                        }
                        case "setFlagAllowCashbackRatesInSearchResults": {
                            BfrlTool.BrowserStorage.AllowCashbackInjection = detail.newState;
                            break;
                        }
                        case "openDisableIncompatibleAddonsDialog": {
                            dstool.OpenDialog({
                                newWidth: 400,
                                newHeight: 320,
                                newURL: "disable/disable_page1.html"
                            }, true);
                            break;
                        }
                        default:
                            break;
                    }
                }
            });
        });
	});
});

window.addEventListener("load", (event) => {
    BfrlTool.BrowserStorage.TurnOffNotifications.then(function (disablednotifications) {
        let temp = disablednotifications;
        if (temp && temp.length <= 0) {
            temp = "";
        }
        _global_mainSettingsIframe.setAttribute("tempsavedlist", temp);
    });
});


var updateTSL = function (event, sender, sendResponse) {
    if (event.targetScript == 'settingsPage.js' && event.action == 'updateTSL') {
        let parentIFrame = _global_settingsCurrentIframe.getAttribute('tempsavedlist');
        let tempy = JSON.parse(parentIFrame);
        let retId = event.data.retailerId;
        delete event.data.retailerId;
        tempy[retId] = event.data;
        _global_settingsCurrentIframe.setAttribute('tempsavedlist', JSON.stringify(tempy));
        _global_mainSettingsIframe.setAttribute('tempsavedlist', JSON.stringify(tempy));
        sendResponse();
        return true;
    }
    return false;
}
try {
    chrome.runtime.onMessage.addListener(updateTSL);
} catch (e) {
    try {
        browser.runtime.onMessage.addListener(updateTSL);
    } catch (e) { }
}
