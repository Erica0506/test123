var couponsFoundUrlSearch = (function(input) {
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
	var couponTotalOutput = document.getElementById("bfrl_couponTotal");
	var couponButton = document.querySelector("#bfrl_couponButton");
	var couponButtonText = document.querySelector("#bfrl_couponButton span");
	var couponTotalMessage = document.getElementById("bfrl_couponTotalMessage");
	var couponTitle = document.getElementById("bfrl_title");

	//It is assumed coupon count is >= 1, because if store doesn't have coupon count, it wouldn't be called here.
	let _couponCount = couponsFoundUrlSearch["count"];

	if (!_couponCount) {
		console.debug("count variable missing, acting as though 0 coupons");
		_couponCount = 0;
	}

	//Coupon count total displayed in boldfaced orange.
	couponTotalOutput.innerText = _couponCount;

	if (parseInt(_couponCount) > 1) {
		couponButtonText.innerText = "Apply Coupons";
		couponTotalMessage.innerText = "COUPON CODES";
		couponTitle.innerText = "Coupons Found!";
	}
	else {
		couponButtonText.innerText = "Apply Coupon";
		couponTotalMessage.innerText = "COUPON CODE";
		couponTitle.innerText = "Coupon Found!";
	}

	chrome.runtime.sendMessage({
	    targetScript: "autoApplyApp.js",
	    action: "setCouponState",
	    data: "TERMINATED"
	}, function () {
	    if (chrome.runtime.lastError) {
	        console.debug(chrome.runtime.lastError.message);
	    }
	});

	couponButton.addEventListener("click", function(event) {
		chrome.runtime.sendMessage({
			targetScript: "autoApplyApp.js",
			action: "testPrepareCoupons"
		}, function () {
		    if (chrome.runtime.lastError) {
		        console.debug(chrome.runtime.lastError.message);
		    }
		});

	}, false);

	let closeButton = document.getElementById("bfrl_closeButton");
	closeButton.addEventListener("click", function() {
		chrome.runtime.sendMessage({
			sourceScript: "couponsfound.js",
			targetScript: "autoApplyApp.js",
			action: "iframeClose",
			data: {
				type: "2"
			}
		}, function () {
		    if (chrome.runtime.lastError) {
		        console.debug(chrome.runtime.lastError.message);
		    }
		});
	});
});