var totalSavedData = document.getElementById("bfrl_totalSaved");
var activatedSuffix = document.getElementById("bfrl_activatedSuffix");
var checkoutButton = document.getElementById("bfrl_continueToCheckoutButton");
var appliedCodeText = document.getElementById("bfrl_codesList");
var rateUsLink = document.getElementById("bfrl_rateUsLink");
var codesText = document.getElementById("bfrl_codesText");
var closeButton = document.getElementById("bfrl_closeButton");
var reportProblem = document.getElementById("bfrl_reportProblem");

function DataTransfer(appliedCode, discount, cashbackrate, currentURL, redirectURL) {
	if (discount === "" || discount === null) {
		//Technical fault.
		discount = "$0.00";
	}
	if (discount.replace) {
		discount = discount.replace("-", "");
		discount = discount.replace("$", "");
		discount = "$" + discount.toString();
	}

	let codes = appliedCode.split(",");

	let andMoreNeeded = (codes.length > 3);
	if (andMoreNeeded)
		codes = codes.slice(0, 3);

	totalSavedData.innerText = discount;

	let child = appliedCodeText.lastElementChild;
	while (child) {
	    appliedCodeText.removeChild(child);
	    child = appliedCodeText.lastElementChild;
	}

    for(let y = 0; y < codes.length; y++){
        let spn = document.createElement("span");
        spn.classList = "bfrl_couponCode bfrl_lightGray";
        spn.innerText += ((y === 0) ? "" : " ") + codes[y];
        appliedCodeText.appendChild(spn);
	}

    if (andMoreNeeded) {
        let spn = document.createElement("span");
        spn.innerText = " and more";
        appliedCodeText.appendChild(spn);
    }
		
	if (codes.length > 1) 
		codesText.innerText = "codes";
	else
		codesText.innerText = "code";

	//NOTE(Thompson): If the discount value is 7 characters or more long, then the font size must be resized. Otherwise, the UI would be broken.
	if (discount.length > 10) {
		let newSize = 72;
		switch (discount.length) {
			case 11:
			case 12:
			case 13:
			case 14:
			case 15:
				newSize *= 0.9;
				break;
			case 16:
			case 17:
			case 18:
			case 19:
			case 20:
				newSize *= 0.8;
				break;
			case 21:
			case 22:
			case 23:
			case 24:
			case 25:
			case 26:
			case 27:
			case 28:
				newSize *= 0.7;
				break;
			default:
				newSize *= 0.6;
				break;
		}
		totalSavedData.style.fontSize = Math.round(newSize).toString() + "px";
	}
	else {
		totalSavedData.style.fontSize = "72px";
	}

	checkoutButton.addEventListener("click", function() {
		chrome.runtime.sendMessage({
			targetScript: "autoApplyApp.js",
			sourceScript: "couponsTesting.js",
			action: "iframeClose",
			data: { type: "7" }
		}, function () {
		    if (chrome.runtime.lastError) {
		        console.debug(chrome.runtime.lastError.message);
		    }
		});
	});
}

var resultRateUrlSearch = (function(input) {
	if (input === "")
		return {};
	var output = {};
	for (var i = 0; i < input.length; ++i) {
		var params = input[i].split('=', 2);
		if (params.length === 1)
			output[params[0]] = "";
		else
			output[params[0]] = decodeURIComponent(params[1].replace(/\+/g, " "));
	}
	return output;
})(window.location.search.substr(1).split('&'));

window.addEventListener("DOMContentLoaded", function() {
	DataTransfer(resultRateUrlSearch["appliedCode"], resultRateUrlSearch["discount"], resultRateUrlSearch["cashbackRate"], resultRateUrlSearch["currentURL"], resultRateUrlSearch["redirectUrl"]);

	rateUsLink.addEventListener("click", function() {
		chrome.runtime.sendMessage({
			targetScript: "autoApplyApp.js",
			action: "setRateUsFlag"
		}, function () {
		    if (chrome.runtime.lastError) {
		        console.debug(chrome.runtime.lastError.message);
		    }
		});

		chrome.runtime.sendMessage({
			targetScript: "autoApplyApp.js",
			action: "openNewRateUsTab"
		}, function () {
		    if (chrome.runtime.lastError) {
		        console.debug(chrome.runtime.lastError.message);
		    }
		});
	});

	closeButton.addEventListener("click", function() {
		new Promise((resolve) => {
			chrome.runtime.sendMessage({
				targetScript: "autoApplyApp.js",
				action: "iframeClose",
				data: { type: "7" }
			}, function () {
			    if (chrome.runtime.lastError) {
			        console.debug(chrome.runtime.lastError.message);
			    }
			});
			resolve();
		}).catch((e) => {
			console.error("(couponsNotFound.js) Error -", e);
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
		console.error("(couponsResultRate.js) Error - ", e);
	});

	reportProblem.addEventListener("click", function() {
		console.log("(couponsResultRate.js) Report problem is clicked.");

		chrome.runtime.sendMessage({
			targetScript: "autoApplyApp.js",
			action: "iframeReportSetURL",
			data: "AutoApplyResources/report/reportProblem.html"
		}, function () {
		    if (chrome.runtime.lastError) {
		        console.debug(chrome.runtime.lastError.message);
		    }
		});
	});
});
