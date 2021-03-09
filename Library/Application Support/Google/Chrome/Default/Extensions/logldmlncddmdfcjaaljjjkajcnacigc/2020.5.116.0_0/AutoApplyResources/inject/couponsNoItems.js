var closeButton = document.getElementById("bfrl_closeButton");
var okButton = document.getElementById("bfrl_continueToCheckoutButton");

window.addEventListener("DOMContentLoaded", function() {
	closeButton.addEventListener("click", function() {
		chrome.runtime.sendMessage({
			sourceScript: "couponsNoItems.js",
			targetScript: "autoApplyApp.js",
			intendedTargetScript: "autoApplyContent.js",
			action: "iframeClose",
			data: { type: "2" }
		}, function () {
		    if (chrome.runtime.lastError) {
		        console.debug(chrome.runtime.lastError.message);
		    }
		});
	});

	okButton.addEventListener("click", function() {
		chrome.runtime.sendMessage({
			sourceScript: "couponsNoItems.js",
			targetScript: "autoApplyApp.js",
			intendedTargetScript: "autoApplyContent.js",
			action: "iframeClose",
			data: { type: "2" }
		}, function () {
		    if (chrome.runtime.lastError) {
		        console.debug(chrome.runtime.lastError.message);
		    }
		});
	});

	new Promise((resolve) => { 
		setTimeout(function() {
			resolve();
		}, 60 * 1000);
	}).then(() => {
	    chrome.runtime.sendMessage({
	        targetScript: "autoApplyApp.js",
	        action: "setCouponState",
	        data: "PAGE_LOAD"
	    }, function () {
	        if (chrome.runtime.lastError) {
	            console.debug(chrome.runtime.lastError.message);
	        }
	    });
	}).catch((e) => {
		console.debug("(couponsNoItems.js) Error - ", e);
	});
});
