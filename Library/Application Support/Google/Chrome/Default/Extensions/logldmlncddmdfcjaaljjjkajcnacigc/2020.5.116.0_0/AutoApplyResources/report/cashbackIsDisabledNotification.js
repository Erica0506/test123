var cashbackDisabledUrlSearch = (function (input) {
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
var reActivateButtonText = document.querySelector("#bfrl_Re-Activate span");
var cashbackDisabledURLParams = cashbackDisabledUrlSearch;

var cashbackPercent = cashbackDisabledURLParams['cashbackRate'];
var hasCoupons = cashbackDisabledURLParams['hasCoupons'] ? "Coupons & " : "";
reActivateButtonText.innerText = 'Re-activate ' + hasCoupons + cashbackPercent;
if (cashbackDisabledURLParams['browserType'] == 'Chrome') {
    let disableButton = document.getElementById('bfrl_disableIncompatibleAdd-Ons');
    disableButton.style.marginTop = '40px';
    disableButton.style.marginBottom = '5px';
    disableButton.style.textAlign = 'center';
    let aTag = document.createElement("a");
    aTag.setAttribute("href", 'chrome-extension://' + chrome.runtime.id + '/disableExtensionsPage.html');
    aTag.setAttribute("target", "_blank");
    let spnTag = document.createElement("span");
    spnTag.classList = "icon-warning-filled";
    spnTag.style.textDecoration = "none";
    let spnTextTag = document.createElement("span");
    spnTextTag.innerText = "Disable Conflicting Add-Ons";
    aTag.appendChild(spnTag);
    aTag.appendChild(spnTextTag);
    disableButton.appendChild(aTag);
}

if (cashbackDisabledURLParams['toolbarType'] == '2') {
    document.getElementById("bfrl_imgLogo").src = "img/couponviewer-logo-faded.png";
    document.getElementById("bfrl_toolbarName").innerText = "Coupon Viewer";
}

window.addEventListener("DOMContentLoaded", function (event) {
    var closeButton = document.getElementById("bfrl_closeButtonRight");
    closeButton.addEventListener("click", function () {
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
    document.querySelector("#bfrl_Re-Activate").addEventListener("click", function () {
        chrome.runtime.sendMessage({
            action: "activateCashback",
            retailerid: cashbackDisabledURLParams['retailerId'],
            cashRedirect: cashbackDisabledURLParams['cashbackURL'],
            showCashbackMessage: true,
            targetScript: "shoptoolbar.js"
        }, function () {
            if (chrome.runtime.lastError) {
                console.debug(chrome.runtime.lastError.message);
            }
        });
        chrome.runtime.sendMessage({
            targetScript: "autoApplyApp.js",
            sourceScript: "couponsTesting.js",
            action: "iframeClose",
            data: { type: "6" }
        }, function () {
		    if(chrome.runtime.lastError) {
		        console.debug(chrome.runtime.lastError.message);
		        }
		    });
    })
    chrome.runtime.sendMessage({
        action: "reactivateloaded",
        targetScript: "shoptoolbar.js"
    }, function () {
        if (chrome.runtime.lastError) {
            console.debug(chrome.runtime.lastError.message);
        }
    });
});