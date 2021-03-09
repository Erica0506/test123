let downloadAreaIndicator = document.getElementById("downloadAreaIndicator");
if (downloadAreaIndicator && downloadAreaIndicator.style.display === "block") {
	let extSearchInstallBox = document.getElementById("divExtendedSearchInstallationStepBox");
	if (extSearchInstallBox) {
		extSearchInstallBox.style.display = "block";
	}
}

var evt = document.createEvent('Event');
evt.initEvent('applyToolbarConversion', true, false);
document.dispatchEvent(evt);