var isChrome = window.openDatabase ? true : false; //For avoiding Obfuscation bugs.
var disableButton = document.getElementById("bfrl_disableExtensionsButton");
var disclaimerInfo = document.querySelector("#bfrl_disableDisclaimerInfo");
var disclaimerInfoText = document.querySelector("#bfrl_disableDisclaimerInfoText");
var disableDisclaimerCloseButton = document.querySelector("#bfrl_disableDisclaimerCloseButton");

disableButton.addEventListener("click", function (event) {
	_sendDisablingMessage("getAllExtensions", null, function (results) {
		//Make sure the returned parameter is an array of results. If it's not a type of Array, we ignore.
		if (Array.isArray(results) && results.length > 0) {
			let json = JSON.stringify(results);
			json = encodeURIComponent(json);
			dstool.OpenDialog({
				newURL: "disable/disable_page2.html?q=" + json + "&localparent=" + disableParams["localparent"],
				newWidth: 400,
				newHeight: 600,
				results: results
			}, false);
		}
		else {
			//NOTE(Thompson): Only when results are returned with an empty array or when there are no extensions, do we call here.
			dstool.OpenDialog({
				newWidth: 400,
				newHeight: 235,
				newURL: "disable/disable_page3.html" + "?localparent=" + disableParams["localparent"]
			}, false);
		}
	});
});

disclaimerInfo.addEventListener("click", function(event) {
	disclaimerInfoText.style.display = "inline-block";
});

disableDisclaimerCloseButton.addEventListener("click", function(event) {
	disclaimerInfoText.style.display = "none";
});
