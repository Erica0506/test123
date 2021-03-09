var closeButton = document.getElementById("bfrl_closeButton");
var messageContent = document.getElementById("bfrl_messageContent");
var checkoutButton = document.getElementById("bfrl_continueToCheckoutButton");

//var reportProblem = document.getElementById("bfrl_reportProblem");

// function DataTransfer(appliedCode, cashbackrate, currentURL, redirectURL) {
// 	messageContent.style.display = "block";
// }

// var resultNoneUrlSearch = (function(input) {
// 	if (input === "")
// 		return {};
// 	var output = {};
// 	for (var i = 0; i < input.length; ++i) {
// 		var params = input[i].split('=', 2);
// 		if (params.length === 1)
// 			output[params[0]] = "";
// 		else
// 			output[params[0]] = decodeURIComponent(params[1].replace(/\+/g, " "));
// 	}
// 	return output;
// })(window.location.search.substr(1).split('&'));

window.addEventListener("DOMContentLoaded", function() {
	// DataTransfer(resultNoneUrlSearch["appliedCode"], resultNoneUrlSearch["cashbackRate"], resultNoneUrlSearch["currentURL"], resultNoneUrlSearch["redirectUrl"]);

	messageContent.style.display = "block";

	checkoutButton.addEventListener("click", function() {
		chrome.runtime.sendMessage({
			targetScript: "autoApplyApp.js",
			sourceScript: "couponsTesting.js",
			intendedTargetScript: "autoApplyContent.js",
			action: "iframeClose",
			data: { type: "7" }
		}, function () {
		    if (chrome.runtime.lastError) {
		        console.debug(chrome.runtime.lastError.message);
		    }
		});
	});

	closeButton.addEventListener("click", function() {
		chrome.runtime.sendMessage({
			sourceScript: "couponsNotFoundNoRates.js",
			targetScript: "autoApplyApp.js",
			intendedTargetScript: "autoApplyContent.js",
			action: "iframeClose",
			data: { type: "7" }
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
		//Should the Promise resolves, this prevents the Promise from resetting the coupon state by checking to see if the checkout button exists on the document.
		if (document.getElementById("bfrl_continueToCheckoutButton")) {
			chrome.runtime.sendMessage({
				targetScript: "autoApplyApp.js",
				action: "setCouponState",
				data: "PAGE_LOAD"
			}, function () {
			    if (chrome.runtime.lastError) {
			        console.debug(chrome.runtime.lastError.message);
			    }
			});
		}
		return;
	}).catch((e) => {
		console.debug("(couponsNotFoundNoRate.js) Error - ", e);
	});

	//reportProblem.addEventListener("click", function() {
	//	let targetPort = chrome.runtime.connect({
	//		name: "autoapplyappPort"
	//	});
	//	chrome.runtime.sendMessage({
	//		targetScript: "autoApplyApp.js",
	//		action: "iframeReportSetURL",
    //		data: "AutoApplyResources/report/reportProblem.html"
	//	});
	//});
});
