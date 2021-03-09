const BrowserType = function () {
    return {
        NONE: -1,
        Chrome: 0,
        Firefox: 1,
        Edge: 2,
        Get: function () {
            //Isolated namespace checking when we can't even access the background script.
            var result = BrowserType.NONE;
            if (typeof browser === "undefined") {
                result = BrowserType.Chrome;
                return result;
            }
            let supportsPromises = false;
            try {
                supportsPromises = browser.runtime.getPlatformInfo() instanceof Promise;
            }
            catch (e) {
                supportsPromises = false;
            }
            if (!supportsPromises)
                result = BrowserType.Edge;
            else
                result = BrowserType.Firefox;
            return result;
        }
    };
}();

window.namespace = (BrowserType.Get() === BrowserType.Chrome ? chrome : browser);

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
var discountAmountBox = document.getElementById("discountAmount");
var cashbackAmountBox = document.getElementById("cashbackAmount");
var cashbackTermsLink = document.getElementById("bfrl_terms");


var sidePanelOpenFlag = false;
var disableCopyGuard = false;

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


function toggleRAFSidePanel() {
    //TODO(Thompson): Need access to the parent element, in order to resize and re-center the dialogs when the link is clicked.
    if (sidePanelOpenFlag) {
        chrome.runtime.sendMessage({
            targetScript: "autoApplyApp.js",
            action: "iframeResize",
            data: {
                newWidth: 746,
                newHeight: 500,
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
                newHeight: 500,
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

function setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    }
    else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    }
}

function DataTransfer(bonusCashback, bonusFriendGets, appliedCode, discount, cashbackrate, currentURL, redirectURL, rafToken, toolbarType, originalSubTotal,cbTerms) {
    cashbackTermsLink.cbTerms = cbTerms;
    cashbackTermsLink.addEventListener("click", _cashbackTermsHandler);
    var cashbackArr = cashbackrate.split(" ");
    var soloRate;
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
            var totalSaved = parseFloat(discount.replace(",", "")) + parseFloat(cashbackAmount);
        } else if (soloAmount) {
            var cashbackAmount = parseFloat(soloAmount);
            var totalSaved = parseFloat(discount.replace(",", "")) + parseFloat(cashbackAmount);
        }

        //NOTE(Thompson): Converts floating points to USD currency format.
        totalSaved = "$" + totalSaved.toFixed(2).toString();
        if (totalSaved == "$NaN" && soloRate) {
            totalSaved = soloRate+"%";
        } else if (totalSaved == "$NaN" && soloAmount) {
            totalSaved = "$"+soloAmount;
        }
    }
    if (appliedCode) {
        let codes = appliedCode.split(",");

        let andMoreNeeded = (codes.length > 3);
        if (andMoreNeeded)
            codes = codes.slice(0, 3);
    }

    totalSavedData.innerText = totalSaved;



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

var resultShareUrlSearch = (function (input) {
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

window.addEventListener("DOMContentLoaded", function (event) {
    DataTransfer(resultShareUrlSearch["bonusCashback"], resultShareUrlSearch['bonusFriendGets'], resultShareUrlSearch["appliedCode"], resultShareUrlSearch["discount"], resultShareUrlSearch["cashbackRate"], resultShareUrlSearch["currentURL"], resultShareUrlSearch["redirectUrl"], resultShareUrlSearch["RAFToken"], resultShareUrlSearch["ToolbarType"], resultShareUrlSearch["originalSubtotal"], resultShareUrlSearch["cbTerms"]);

    function closeHandler() {
        chrome.runtime.sendMessage({
            sourceScript: "couponsnotfound.js",
            targetScript: "autoApplyApp.js",
            intendedTargetScript: "autoApplyContent.js",
            action: "iframeClose",
            data: {
                type: "2"
            }
        }, function () {
            if (chrome.runtime.lastError) {
                console.debug(chrome.runtime.lastError.message);
            }
        });
    }
    closeButton1.addEventListener("click", closeHandler);
    closeButton2.addEventListener("click", closeHandler);

    new Promise((resolve) => {
        setTimeout(function () {
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
        console.debug("(couponsResultRate.js) Error - ", e);
    });

    reportProblem.addEventListener("click", function () {
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

    shareUsLink.addEventListener("click", function (e) {
        chrome.runtime.sendMessage({
            targetScript: "buttonApp.js",
            action: "getReferralLinks"
        }, function (data) {

            if (chrome.runtime.lastError) {
                console.debug(chrome.runtime.lastError.message);
            }

            //It's only when referral links are there, do we then set the event listeners to the buttons.
            facebookButton.addEventListener("click", function (e) {
                window.open(data.Facebook, 'targetWindow', 'toolbar=no,location=0,status=no,menubar=no,scrollbars=yes,resizable=yes,width=600,height=400');
                return false;
            });

            twitterButton.addEventListener("click", function (e) {
                window.open(data.Twitter, 'targetWindow', 'toolbar=no,location=0,status=no,menubar=no,scrollbars=yes,resizable=yes,width=600,height=400');
                return false;
            });

            copyButton.addEventListener("click", function (e) {
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
                        copyButtonText.innerText = "Copy Link";
                        copyButton.classList.remove("btncopied");
                        copyButton.classList.add("btncopy");
                        disableCopyGuard = false;
                    }, 4000);
                }
                catch (e) {
                    console.debug("(couponsResultShare.js) Error -", e);
                }
            });

            rafLinkInputBox.value = data.Copy.substr(12);

            toggleRAFSidePanel();
        });
    });
});

toggleRAFSidePanel();