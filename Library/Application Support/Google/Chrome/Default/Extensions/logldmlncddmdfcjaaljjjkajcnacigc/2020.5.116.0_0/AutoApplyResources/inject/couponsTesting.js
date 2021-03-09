var progressBar = document.getElementById("bfrl_progressBar");
var completionBar = document.getElementById("bfrl_completionBar");
completionBar.style.width = "0";
completionBar.style.height = "48px";
completionBar.style.backgroundColor = "#F9591E";
var count = 0;
var output = document.getElementById("bfrl_output");
var codeString = document.getElementById("bfrl_couponCodeString");
var reportProblem = document.getElementById("bfrl_reportProblem");
var closeButton = document.getElementById("bfrl_closeButton");

var couponTestingUrlSearch = (function(input) {
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
	switch (couponTestingUrlSearch["action"]) {
	    case "updateProgress":
		    try {
				completionBar.style.width = ((parseInt(couponTestingUrlSearch["index"]) / parseInt(couponTestingUrlSearch["total"])) * 100).toString() + "%";
				completionBar.style.height = "48px";
				output.innerText = "Trying code " + couponTestingUrlSearch["index"] + " of " + couponTestingUrlSearch["total"];
				codeString.innerText = couponTestingUrlSearch["code"];
				chrome.runtime.sendMessage({
					targetScript: "autoApplyApp.js",
					action: "applyCouponBackground_testApplyCoupon"
				}, function () {
				    if (chrome.runtime.lastError) {
				        console.debug(chrome.runtime.lastError.message);
				    }
				});
			}
			catch (e) {
				console.debug("(couponsTesting.js) Error -", e);
			}
			break;
		case "prepareProgress":
			try {
				completionBar.style.width = "0%";
				completionBar.style.height = "48px";
				output.innerText = "Preparing...  ";
				codeString.innerText = couponTestingUrlSearch["data"];
			}
			catch (e) {
				console.debug(e);
			}
			break;
		case "output":
			output.innerText = couponTestingUrlSearch["text"];
			break;
	    case "applyingMax":
	        output.innerText = "Calculating maximum savings.";
	        codeString.style.display = "none";
	        break;
	}

	closeButton.addEventListener("click", function() {
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
});
//Why do we have both?  initial load.
var adjustProgress = function (event, sender, sendResponse) {
    if (event.action == 'iframeAdjustProgress') {
        switch (event.message.action) {
            case "updateProgress":
                try {
                    completionBar.style.width = ((parseInt(event.message.index) / parseInt(event.message.total)) * 100).toString() + "%";
                    completionBar.style.height = "48px";
                    output.innerText = "Trying code " + event.message.index + " of " + event.message.total;
					codeString.innerText = decodeURIComponent(event.message.code);
                    chrome.runtime.sendMessage({
                        targetScript: "autoApplyApp.js",
                        action: "applyCouponBackground_testApplyCoupon"
                    }, function () {
                        if (chrome.runtime.lastError) {
                            console.debug(chrome.runtime.lastError.message);
                        }
                    });
                }
                catch (e) {
                    console.debug("(couponsTesting.js) Error -", e);
                }
                break;
            case "prepareProgress":
                try {
                    completionBar.style.width = "0%";
                    completionBar.style.height = "48px";
                    output.innerText = "Preparing...  ";
                    codeString.innerText = event.message.data;
                }
                catch (e) {
                    console.error(e);
                }
                break;
            case "applyingMax":
                output.innerText = "Calculating maximum savings.";
                codeString.style.display = "none";
                break;
            case "output":
                output.innerText = event.message.text;
                break;
        }
        sendResponse();
        return true;
    } else {
        return false;
    }
};

try{
    chrome.runtime.onMessage.addListener(adjustProgress);
} catch (e) {
    try {
        browser.runtime.onMessage.addListener(adjustProgress);
    } catch (e) { }
}