// var rateButton = document.getElementById("rateButton");

var totalSavedData = document.getElementById("bfrl_totalSaved");
var cashbackRateText = document.getElementById("bfrl_cashbackRate");
var activatedSuffix = document.getElementById("bfrl_activatedSuffix");
var checkoutButton = document.getElementById("bfrl_continueToCheckoutButton");
var appliedCodeText = document.getElementById("bfrl_codesList");
var rateUsLink = document.getElementById("bfrl_rateUsLink");
var codesText = document.getElementById("bfrl_codesText");
var closeButton = document.getElementById("bfrl_closeButton");
var reportProblem = document.getElementById("bfrl_reportProblem");
var bonusCashbackRateTexts = document.querySelectorAll("span.bfrl_bonusCashback");
var discountAmountBox = document.getElementById("discountAmount");
var cashbackAmountBox = document.getElementById("cashbackAmount");
var cashbackTermsLink = document.getElementById("bfrl_terms");

function _cashbackTermsHandler(evt) {
    let rContent = document.querySelector("#retailerContent .ss-content");
    if (rContent) rContent.scrollTop = 0;

    //Terms are stored in JSON to prevent dead object in firefox when dom is altered
    let cbTermsContainer = document.querySelector("#retailerCBTermsContainer");
    cbTermsContainer.innerHTML = DOMPurify.sanitize(cashbackTermsLink.cbTerms);
    //Override the CSS property after the terms CSS <style> has been loaded.
    let div = cbTermsContainer.querySelector(".merchant-terms-active");
    div.style.boxShadow = "rgba(0, 0, 0, 0.3) 2px 2px 3px 0px";
    div.style.width = "380px";
    div.style.margin = "0 auto";
    div.style.position = "relative";
    div.style.border = "1px solid #ccc";
    div.style.maxHeight = "475px";
    div.style.overflowY = "auto";

    let closeClone = document.querySelector("#retailerCBTermsCloseButton").cloneNode(true);
    closeClone.id = "closeClone";
    closeClone.style.float = "right";
    closeClone.style.margin = "5px 8px";
    closeClone.style.cursor = "pointer";

    let locationNode = document.querySelector(".terms-header.merchant-terms-header");
    locationNode.parentNode.insertBefore(closeClone, locationNode);

    //Display the results.
    let retailerCBTerms = document.querySelector("#retailerCBTerms");
    retailerCBTerms.classList.remove("cbTerms_hide");
    retailerCBTerms.classList.add("cbTerms_show");

    closeClone.addEventListener("click", function () {
        let retailerCBTerms = document.querySelector("#retailerCBTerms");
        retailerCBTerms.classList.add("cbTerms_hide");
        retailerCBTerms.classList.remove("cbTerms_show");
    });
}


// var rateButtonPNG = chrome.runtime.getURL("AutoApplyResources/inject/img/rateButton.png");
// var rateButtonHoverPNG = chrome.runtime.getURL("AutoApplyResources/inject/img/rateButtonHover.png");

function DataTransfer(bonusCashback, bonusFriendGets, appliedCode, discount, cashbackrate, currentURL, redirectURL, rafToken, toolbarType, originalSubTotal, cbTerms) {
    cashbackTermsLink.cbTerms = cbTerms;
    cashbackTermsLink.addEventListener("click", _cashbackTermsHandler);
    var cashbackArr = cashbackrate.split(" ");
    var soloRate;
    var soloAmount;
    for (var i = 0; i < cashbackArr.length; i++) {
        if (cashbackArr[i].includes("%")) {
            soloRate = cashbackArr[i].replace("%", "");
        } if (cashbackArr[i].includes("$")) {
            soloAmount = cashbackArr[i].replace("$", "");
        }
    }
    if (discount === "" || discount == null) {
        discount = "$0.00";
    }
    if (discount.replace) {
        discount = discount.replace("-", "");
        discount = discount.replace("$", "");
        var numOriginalSubTotal = parseFloat(originalSubTotal);
        var numDiscount = parseFloat(discount.replace(",", ""));
        var amountToBeDiscounted = numOriginalSubTotal - numDiscount;
        if (soloRate) {
            var cashbackAmount = amountToBeDiscounted * (parseFloat(soloRate) / 100);
        } else if (soloAmount) {
            var cashbackAmount = parseFloat(soloAmount);
        }
        var totalSaved = parseFloat(discount.replace(",", "")) + parseFloat(cashbackAmount);

        //NOTE(Thompson): Converts floating points to USD currency format.
        totalSaved = "$" + totalSaved.toFixed(2).toString();
    }

    let codes = appliedCode.split(",");

    let andMoreNeeded = (codes.length > 3);
    if (andMoreNeeded)
        codes = codes.slice(0, 3);

    cashbackRateText.innerText = cashbackrate;
    cashbackRateText.style.fontSize = "15px";
    activatedSuffix.style.fontSize = "15px";
    if (cashbackrate.length > 17) {
        activatedSuffix.style.display = "none";
    }
    discountAmountBox.innerText = "$" + discount;
    cashbackAmountBox.innerText = "$" + cashbackAmount.toFixed(2);
    totalSavedData.innerText = totalSaved;

    let child = appliedCodeText.lastElementChild;
    while (child) {
        appliedCodeText.removeChild(child);
        child = appliedCodeText.lastElementChild;
    }

    for (let y = 0; y < codes.length; y++) {
        let spn = document.createElement("span");
        spn.classList = "bfrl_couponCode_small bfrl_lightGray";
        spn.innerText += ((y === 0) ? "" : " ") + codes[y];
        appliedCodeText.appendChild(spn);
    }

    if (andMoreNeeded) {
        let spn = document.createElement("span");
        spn.innerText = " and more";
        appliedCodeText.appendChild(spn);
    }

    //adjust line-height since possible 2 lines of codes
    if (codes.length > 2) {
        let trRows = document.querySelectorAll("#detailsTable tr");
        for (let z = 0; z < trRows.length; z++) {
            trRows[z].style.lineHeight = "22px";
        }
    }


    if (bonusCashback && bonusCashback.length > 0) {
        for (let i = 0; i < bonusCashbackRateTexts.length; i++) {
            bonusCashbackRateTexts[i].innerText = bonusCashback;
        }
    }

    //NOTE(Thompson): Keep the commented code in, in case situations arise where we would really have to .
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

    checkoutButton.addEventListener("click", function () {
        chrome.runtime.sendMessage({
            targetScript: "autoApplyApp.js",
            action: "iframeClose",
            data: {
                type: "7"
            }
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
    DataTransfer(resultRateUrlSearch["bonusCashback"], resultRateUrlSearch['bonusFriendGets'], resultRateUrlSearch["appliedCode"], resultRateUrlSearch["discount"], resultRateUrlSearch["cashbackRate"], resultRateUrlSearch["currentURL"], resultRateUrlSearch["redirectUrl"], resultRateUrlSearch["RAFToken"], resultRateUrlSearch["ToolbarType"], resultRateUrlSearch["originalSubtotal"], resultRateUrlSearch["cbTerms"]);

	// rateButton.setAttribute("src", rateButtonPNG);
	// rateButton.addEventListener("mouseover", function() {
	// 	this.setAttribute("src", rateButtonHoverPNG);
	// });
	// rateButton.addEventListener("mouseleave", function() {
	// 	this.setAttribute("src", rateButtonPNG);
	// });

	rateUsLink.addEventListener("click", function() {
		chrome.runtime.sendMessage({
			targetScript: "autoApplyApp.js",
			action: "setRateUsFlag"
		}, function() {
			chrome.runtime.sendMessage({
				targetScript: "autoApplyApp.js",
				action: "openNewRateUsTab"
			}, function () {
			    if (chrome.runtime.lastError) {
			        console.debug(chrome.runtime.lastError.message);
			    }
			});
		});
	});

	closeButton.addEventListener("click", function() {
		new Promise((resolve) => {
			chrome.runtime.sendMessage({
				targetScript: "autoApplyApp.js",
				action: "iframeClose",
				data: {
					type: "7"
				}
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