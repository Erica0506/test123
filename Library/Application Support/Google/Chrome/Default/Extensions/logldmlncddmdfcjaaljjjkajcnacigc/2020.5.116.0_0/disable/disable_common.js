//NOTE(Thompson): Any "disable_XXX.js" is part of the iframe document and resides inside the iframe.
//All iframes cannot directly communicate with the background script, and must either use message passing,
//or invoke a function call to the parent of the iframes, which has visibility to the content scripts.

function IsChrome() {
	return window.openDatabase ? true : false;
}

/**
 * Automatically decodes the URI component for the specified query parameters in the URI, then returns the data.
 * @param {string} key - The key name of the query parameter.
 * @returns {any}
 */
var disableParams = (function (input) {
	if (input == "")
		return {};
	var output = {};
	for (var i = 0; i < input.length; ++i) {
		var params = input[i].split('=', 2);
		if (params.length == 1)
			output[params[0]] = "";
		else
			output[params[0]] = decodeURIComponent(params[1].replace(/\+/g, " "));
	}
	return output;
})(window.location.search.substr(1).split('&'));

var hasLocalParent = disableParams["localparent"] && disableParams["localparent"] == "1";
var dstool = disableParams["localparent"] == "1" ? parent.dstool : chrome.extension.getBackgroundPage().DisableSystem;

function _sendDisablingMessage(action, data, callback) {
	let alldata = !data ? "" : data;
	if (!callback)
		callback = function (any) { };
	if (IsChrome()) {
		if (!hasLocalParent) {
			chrome.runtime.sendMessage({
				targetScript: "disableBackgroundApp.js",
				action: action,
				data: alldata
			}, function (results) {
				callback(results)
			});
		}
		else {
			parent._BlankSendMessage("disableBackgroundApp.js", action, alldata, callback);
		};
	}
	else {
		if (!hasLocalParent) {
			//This is Firefox. Edge doesn't support "management", so it's fine to do this.
			browser.runtime.sendMessage({
				targetScript: "disableBackgroundApp.js",
				action: action,
				data: alldata,
				callback: callback
			}).then(function (results) {
				callback(results)
			});
		}
		else {
			parent._BlankSendMessage("disableBackgroundApp.js", action, alldata, callback);
		};
	}
}

function closeButtonListener(event) {
	//NOTE(Thompson): This is how we invoke calls from the parent document when inside an iframe.
	if (hasLocalParent)
		parent.closeTab();
	else
		dstool.CloseDialog();
}

var closeButton = document.getElementById('bfrl_closeButton');
closeButton.addEventListener("click", closeButtonListener);

var browseStoresButton = document.querySelector("#bfrl_browseStoresButton");
if (browseStoresButton) {
	browseStoresButton.addEventListener("click", (event) => {
		dstool.OpenCashbackStoresTab();
	});
}