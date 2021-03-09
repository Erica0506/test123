var deeplinkURL = document.getElementById("bfrl_deeplink");
var closeButton = document.getElementById("bfrl_closeButton");
var backButton = document.getElementById("bfrl_backButton");

function CloseEveryDialogs(event) {
	if (!event) {
		event = window.event;
	}
	event.stopPropagation();
	event.stopImmediatePropagation();
	event.preventDefault();
	event.cancelBubble = true;

	chrome.runtime.sendMessage({
	    targetScript: "autoApplyApp.js",
	    action: "iframeClose",
	    data: { type: "6" }
	}, function () {

	    if (chrome.runtime.lastError) {
	        console.debug(chrome.runtime.lastError.message);
	    }

		chrome.runtime.sendMessage({
			targetScript: "autoApplyApp.js",
			action: "iframeClose",
			data: { type: "report" }
		}, function () {
		    if (chrome.runtime.lastError) {
		        console.debug(chrome.runtime.lastError.message);
		    }
		});
	});
}

function ReturnToAutoApply(event) {
	if (!event) {
		event = window.event;
	}
	event.stopPropagation();
	event.stopImmediatePropagation();
	event.preventDefault();
	event.cancelBubble = true;
	chrome.runtime.sendMessage({
		targetScript: "autoApplyApp.js",
		action: "iframeClose",
		data: { type: "6" }
	}, function () {
		chrome.runtime.sendMessage({
			targetScript: "autoApplyApp.js",
			action: "OpenApplyCouponDialog"
		}, function () {
			//Report iframe needs to be closed last, in order for the script to continue running for callbacks.
			chrome.runtime.sendMessage({
				targetScript: "autoApplyApp.js",
				action: "iframeClose",
				data: { type: "report" }
			}, function () { });
		});
	});
}

window.addEventListener("DOMContentLoaded", function(loadedEvent) {
	deeplinkURL.addEventListener("click", function(event) {
		CloseEveryDialogs(event);
	});
	closeButton.addEventListener("click", function(event) {
		CloseEveryDialogs(event);
	});
	backButton.addEventListener("click", function (event) {
		ReturnToAutoApply(event);
	});
});