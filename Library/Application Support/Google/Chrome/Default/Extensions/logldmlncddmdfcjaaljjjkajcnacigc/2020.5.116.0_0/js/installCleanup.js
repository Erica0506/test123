var installationElement = document.getElementById("downloadAreaIndicator");
if (installationElement) {
    installationElement.setAttribute("installed", "true");
}

var evt = document.createEvent('Event');
evt.initEvent('applyToolbarConversion', true, false);
document.dispatchEvent(evt);

localStorage['skipTour'];