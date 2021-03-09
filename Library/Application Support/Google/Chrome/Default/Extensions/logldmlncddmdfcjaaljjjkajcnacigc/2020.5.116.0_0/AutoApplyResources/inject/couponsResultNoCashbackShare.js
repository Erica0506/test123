var totalSavedData = document.getElementById("bfrl_totalSaved");
var cashbackRateText = document.getElementById("bfrl_cashbackRate");
var activatedSuffix = document.getElementById("bfrl_activatedSuffix");
var checkoutButton = document.getElementById("bfrl_continueToCheckoutButton");
var reportProblem = document.getElementById("bfrl_reportProblem");
var closeButton1 = document.querySelector(".sidePanel_close #bfrl_closeButton");
var closeButton2 = document.querySelector(".sidePanel_open #bfrl_closeButton");
var bonusCashbackRateTexts = document.querySelectorAll("span.bfrl_bonusCashback");
var bonusFriendGetsTexts = document.querySelectorAll("span.bfrl_bonusFriendGets");
var bonusRemove = document.querySelectorAll(".bfrl_ref");
var appliedCodeText = document.getElementById("bfrl_codesList");
var shareUsLink = document.getElementById("bfrl_shareUsLink");
var facebookButton = document.getElementById("bfrl_facebookButton");
var twitterButton = document.getElementById("bfrl_twitterButton");
var copyButton = document.getElementById("bfrl_copyTextButton");
var rafLinkInputBox = document.getElementById("bfrl_rafLinkInputBox");
var codesText = document.getElementById("bfrl_codesText");

var sidePanelOpenFlag = false;
var disableCopyGuard = false;

function toggleRAFSidePanel() {
	//TODO(Thompson): Need access to the parent element, in order to resize and re-center the dialogs when the link is clicked.
	if (sidePanelOpenFlag) {
		chrome.runtime.sendMessage({
			targetScript: "autoApplyApp.js",
			action: "iframeResize",
			data: {
				newWidth: 746,
				newHeight: 450,
				centered: true
			}
		}, function () {
		    if (chrome.runtime.lastError) {
		        console.debug(chrome.runtime.lastError.message);
		    }
			document.querySelector(".sidePanel_open").style.display = "block";
			document.querySelector(".sidePanel_close").style.display = "none";
			document.querySelector("#bfrl_rightSection").style.display = "block";
		});
	}
	else {
		chrome.runtime.sendMessage({
			targetScript: "autoApplyApp.js",
			action: "iframeResize",
			data: {
				newWidth: 476,
				newHeight: 450,
				centered: true
			}
		}, function () {
		    if (chrome.runtime.lastError) {
		        console.debug(chrome.runtime.lastError.message);
		    }
			document.querySelector(".sidePanel_open").style.display = "none";
			document.querySelector(".sidePanel_close").style.display = "block";
			document.querySelector("#bfrl_rightSection").style.display = "none";
		});
	}

	sidePanelOpenFlag = !sidePanelOpenFlag;
}

function DataTransfer(bonusCashback, bonusFriendGets, appliedCode, discount, cashbackrate, currentURL, redirectURL, rafToken, toolbarType) {
	if (discount === "" || discount === null) {
		discount = "$0.00";
	}
	if (discount.replace) {
		discount = discount.replace("-", "");
		discount = discount.replace("$", "");

		//NOTE(Thompson): Converts floating points to USD currency format.
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

	for (let y = 0; y < codes.length; y++) {
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

	if (bonusCashback && bonusCashback.length > 0) {
		for (let i = 0; i < bonusCashbackRateTexts.length; i++) {
			bonusCashbackRateTexts[i].innerText = bonusCashback;
		}
	}
	else {
		for (let i = 0; i < bonusRemove.length; i++) {
			bonusRemove[i].style.display = "none";
		}
	}

	if (bonusFriendGets && bonusFriendGets.length > 0) {
		for (let i = 0; i < bonusCashbackRateTexts.length; i++) {
			bonusFriendGetsTexts[i].innerText = bonusFriendGets;
		}
	}

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
			intendedTargetScript: "autoApplyContent.js",
			action: "iframeClose",
			data: { type: "7" }
		}, function () {
		    if (chrome.runtime.lastError) {
		        console.debug(chrome.runtime.lastError.message);
		    }
		});
	});
}

function setSelectionRange(input, selectionStart, selectionEnd) {
	if (input.setSelectionRange) {
		input.focus();
		input.setSelectionRange(selectionStart, selectionEnd);
	} else if (input.createTextRange) {
		var range = input.createTextRange();
		range.collapse(true);
		range.moveEnd('character', selectionEnd);
		range.moveStart('character', selectionStart);
		range.select();
	}
}

function setCaretToPos(input, pos) {
	setSelectionRange(input, pos, pos);
}

var DelayPromise = function(delay) {
	return function(data) {
		return new Promise(function(resolve, reject) {
			setTimeout(function() {
				resolve(data);
			}, delay);
		});
	};
};

var resultShareUrlSearch = (function(input) {
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

window.addEventListener("DOMContentLoaded", function(event) {
	DataTransfer(resultShareUrlSearch["bonusCashback"], resultShareUrlSearch['bonusFriendGets'], resultShareUrlSearch["appliedCode"], resultShareUrlSearch["discount"], resultShareUrlSearch["cashbackRate"], resultShareUrlSearch["currentURL"], resultShareUrlSearch["redirectUrl"], resultShareUrlSearch["RAFToken"], resultShareUrlSearch["ToolbarType"]);

	function closeHandler() {
		chrome.runtime.sendMessage({
			sourceScript: "couponsnotfound.js",
			targetScript: "autoApplyApp.js",
			intendedTargetScript: "autoApplyContent.js",
			action: "iframeClose",
			data: { type: "2" }
		}, function () {
		    if (chrome.runtime.lastError) {
		        console.debug(chrome.runtime.lastError.message);
		    }
		});
	}
	closeButton1.addEventListener("click", closeHandler);
	closeButton2.addEventListener("click", closeHandler);

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
		return;
	}).catch((e) => {
		console.debug("(couponsResultRate.js) Error - ", e);
	});

	reportProblem.addEventListener("click", function() {
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

	shareUsLink.addEventListener("click", function(e) {
		chrome.runtime.sendMessage({
			targetScript: "buttonApp.js",
			action: "getReferralLinks"
		}, function (data) {

		    if (chrome.runtime.lastError) {
		        console.debug(chrome.runtime.lastError.message);
		    }

			//It's only when referral links are there, do we then set the event listeners to the buttons.
			facebookButton.addEventListener("click", function(e) {
				window.open(data.Facebook, 'targetWindow', 'toolbar=no,location=0,status=no,menubar=no,scrollbars=yes,resizable=yes,width=600,height=400');
				return false;
			});
		
			twitterButton.addEventListener("click", function(e) {
				window.open(data.Twitter, 'targetWindow', 'toolbar=no,location=0,status=no,menubar=no,scrollbars=yes,resizable=yes,width=600,height=400');
				return false;
			});

			copyButton.addEventListener("click", function(e) {
				try {
					if (disableCopyGuard)
							return;
					disableCopyGuard = true;
					var copyButtonText = copyButton.querySelector("span");
		
					//TODO(Thompson): Add the correct referral link instead of the template URL.
					setSelectionRange(rafLinkInputBox, 0, rafLinkInputBox.value.length);
					var isSupported = document.execCommand("copy", false, null);
					if (!isSupported) {
							throw "document.execCommand() - Copy command is not supported.";
					}
		
					setSelectionRange(rafLinkInputBox, 0, 0);
		
					//NOTE(Thompson): Displays the "Copied" text underneath the Copy button for 4 seconds, then hide it, if the copy action is successful.
					copyButtonText.innerText = "Copied";
					copyButton.classList.add("btncopied");
					setTimeout(function () {
							copyButtonText.innerText = "Copy";
							copyButton.classList.remove("btncopied");
							copyButton.classList.add("btncopy");
							disableCopyGuard = false;
					}, 4000);
				}
				catch (e) {
					console.debug("(couponsResultShare.js) Error -", e);
				}
			});

			rafLinkInputBox.value = data.Copy;

			toggleRAFSidePanel();
		});
	});
});

toggleRAFSidePanel();