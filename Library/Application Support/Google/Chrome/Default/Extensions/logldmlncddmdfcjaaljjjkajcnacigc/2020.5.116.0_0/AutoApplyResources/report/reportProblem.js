var closeButton = document.getElementById("bfrl_closeButton");
var backButton = document.getElementById("bfrl_backButton");
var submitButton = document.getElementById("bfrl_submitButton");
var commentField = document.getElementById("bfrl_commentField");
var emailField = document.getElementById("bfrl_emailField");

function DataTransfer(username) {
	if (!!username) {
		emailField.value = username;
		emailField.className = "bfrl_boxsizingBorder disabled";
		emailField.disabled = true;
		emailField.readOnly = true;
	}
}

var resultProblemSearch = (function (input) {
	if (input == "")
		return {};
	var output = {};
	for (var i = 0; i < input.length; ++i) {
		var params = input[i].split('=', 2);
		if (params.length == 1)
			output[params[0]] = "";
		else
			output[params[0]] = decodeURIComponent(params[1].replace(/\+/g, " "));
	}
	return output;
})(window.location.search.substr(1).split('&'));

function SelectedRadioButton() {
	let selectedRadio = document.querySelector("input[type='radio']:checked");
	if (selectedRadio && selectedRadio.value) {
		return selectedRadio.value;
	}
	else return "Other";
}

function validateEmail(email) {
	var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

function ObtainMessage() {
	return "[" + SelectedRadioButton() + "] " + commentField.value;
}

var otherFocused = false;
function Validate() {
	let radioIsSelected = (document.querySelector("input[type='radio']:checked") != null);
	let otherChecked = (SelectedRadioButton() === "Other");
	let commentsFilledOut = (commentField.value.length > 0);

	if (commentField.value.length <= 0 && emailField.value.length <= 0 && !radioIsSelected) {
		document.querySelector("#bfrl_errorMessage").innerText = "";
		return false;
	}
	else if (emailField.value.length > 0 && !validateEmail(bfrl_emailField.value)) {
		document.querySelector("#bfrl_errorMessage").innerText = "Invalid email address";
		submitButton.className = "btnsubmit-disabled";
		return false;
	}
	else if (commentField.value.length <= 0 && radioIsSelected) {
		if (otherChecked) {
			document.querySelector("#bfrl_errorMessage").innerText = "Please enter your comments";
			submitButton.className = "btnsubmit-disabled";
			commentField.className = "bfrl_boxsizingBorder required";
			if (!otherFocused) {
				otherFocused = true;
				commentField.focus();
			}
			return false;
		}
		else {
			document.querySelector("#bfrl_errorMessage").innerText = "";
			submitButton.className = "btnsubmit";
			commentField.className = "bfrl_boxsizingBorder bfrl_inactive";
			otherFocused = false;
			return true;
		}
	}
	else if (radioIsSelected && !otherChecked && commentField.value.length <= 0) {
		document.querySelector("#bfrl_errorMessage").innerText = "";
		submitButton.className = "btnsubmit";
		commentField.className = "bfrl_boxsizingBorder bfrl_inactive";
		otherFocused = false;
		return true;
	}
	else {
		document.querySelector("#bfrl_errorMessage").innerText = "";
	}

	if (!otherChecked && commentsFilledOut) {
		submitButton.className = "btnsubmit";
		commentField.className = "bfrl_boxsizingBorder bfrl_inactive";
		otherFocused = false;
		return true;
	}
	else if (otherChecked && commentsFilledOut) {
		submitButton.className = "btnsubmit";
		commentField.className = "bfrl_boxsizingBorder bfrl_inactive";
		otherFocused = false;
		return true;
	}
	else if (otherChecked) {
		submitButton.className = "btnsubmit-disabled";
		commentField.className = "bfrl_boxsizingBorder required";
		if (!otherFocused) {
			otherFocused = true;
			commentField.focus();
		}
		return false;
	}
	else {
		submitButton.className = "btnsubmit";
		commentField.className = "bfrl_boxsizingBorder bfrl_inactive";
		otherFocused = false;
		return true;
	}
}

window.addEventListener("load", function () {
	DataTransfer(resultProblemSearch["username"]);

	closeButton.addEventListener("click", function (event) {
		if (!event) {
			event = window.event;
		}
		event.stopPropagation();
		event.stopImmediatePropagation();
		event.preventDefault();
		event.cancelBubble = true;

		chrome.runtime.sendMessage({
			targetScript: "autoApplyApp.js",
			action: "iframeClose",
			data: { type: "report" }
		}, function () {
		    if (chrome.runtime.lastError) {
		        console.debug(chrome.runtime.lastError.message);
		    }
		});

		chrome.runtime.sendMessage({
			targetScript: "autoApplyApp.js",
			action: "iframeClose",
			data: { type: "6" }
		}, function () {
		    if (chrome.runtime.lastError) {
		        console.debug(chrome.runtime.lastError.message);
		    }
		});
	});

	backButton.addEventListener("click", function (event) {
		try {
			if (!event) {
				event = window.event;
			}
			event.stopPropagation();
			event.stopImmediatePropagation();
			event.preventDefault();
			event.cancelBubble = true;
			//This closes the paused AutoApply Coupons dialogs behind the report dialog.
			chrome.runtime.sendMessage({
				targetScript: "autoApplyApp.js",
				action: "iframeClose",
				data: { type: "6" }
			}, function () {

			    if (chrome.runtime.lastError) {
			        console.debug(chrome.runtime.lastError.message);
			    }

				//Re-open the AutoApply Coupons dialog, showing the Coupons Found dialog.
				chrome.runtime.sendMessage({
					targetScript: "autoApplyApp.js",
					action: "OpenApplyCouponDialog"
				}, function () {

				    if (chrome.runtime.lastError) {
				        console.debug(chrome.runtime.lastError.message);
				    }

					//Report iframe needs to be closed last, in order for the script to continue running for callbacks.
					chrome.runtime.sendMessage({
						targetScript: "autoApplyApp.js",
						action: "iframeClose",
						data: { type: "report" }
					}, function () {
					    if (chrome.runtime.lastError) {
					        console.debug(chrome.runtime.lastError.message);
					    }
					});
				});
			});
		}
		catch (e) {
			console.error("reportProblem.js) " + e);
		}
	});

	let radioButtons = document.querySelectorAll("input[type='radio']");
	for (let i = 0; i < radioButtons.length; ++i) {
		radioButtons[i].addEventListener("change", function (event) {
			Validate();
		});
	}
	let radioButtonTexts = document.querySelectorAll("span.bfrl_radioButtonOption");
	for (let i = 0; i < radioButtonTexts.length; i++) {
		radioButtonTexts[i].addEventListener("click", function (event) {
			radioButtons[i].click();
		});
	}

	commentField.addEventListener("keyup", function (event) {
		Validate();
	});

	commentField.addEventListener("blur", function (event) {
		Validate();
	});

	emailField.addEventListener("focus", function (event) {
		Validate();
	});

	emailField.addEventListener("blur", function (event) {
		Validate();
	});

	submitButton.addEventListener("click", function (event) {
		if (submitButton.className.indexOf("btnsubmit-disabled") >= 0) {
			event.preventDefault();
		}
		else {
			chrome.runtime.sendMessage({
				targetScript: "autoApplyApp.js",
				action: "sendFeedback",
				data: {
					email: document.getElementById("bfrl_emailField").value,
					body: ObtainMessage()
				}
			}, function () { });

			chrome.runtime.sendMessage({
				targetScript: "autoApplyApp.js",
				action: "iframeReportSetURL",
				data: "AutoApplyResources/report/thankYou.html"
			}, function () { });

		}
	});
});