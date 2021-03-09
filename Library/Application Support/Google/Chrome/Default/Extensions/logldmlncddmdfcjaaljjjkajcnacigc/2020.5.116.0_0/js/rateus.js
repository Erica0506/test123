var befrugalSiteSecure = "https://www.befrugal.com/";

var className = document.getElementsByClassName("no-button");
for (let i = 0; i < className.length; i++) {
	if (className[i].id !== "loveUs_No") {
		className[i].addEventListener("click", windowClose);
	}
	else {
		className[i].addEventListener("click", setNoMoreInvites);
	}
}

className = document.getElementsByClassName("close");
for (let i = 0; i < className.length; i++) {
	className[i].addEventListener("click", windowClose);
}

className = document.getElementsByClassName("report-a-problem");
for (let i = 0; i < className.length; i++) {
	className[i].addEventListener("click", setNoMoreInvites);
}


var allDone = document.getElementById("allDone");
if (allDone)
	allDone.addEventListener("click", windowClose);

var feedback = document.getElementById("feedback");
if (feedback)
	feedback.addEventListener("submit", validateForm);

var rateYes = document.getElementById("rateUs_Yes");
if (rateYes)
	rateYes.addEventListener("click", sendToRate);

function setNoMoreInvites() {
	parent.postMessage("setPref,NoMoreInvites,true", befrugalSiteSecure);
}

function resetClicks() {
	parent.postMessage("setPref,Clicks", befrugalSiteSecure);
}

function windowClose(info) {

	parent.postMessage("close", befrugalSiteSecure);
	resetClicks();

	if (info === "Rating")
		setNoMoreInvites();
}

function validateForm(event) {
	event.preventDefault();
	var feedback = document.getElementById("feedback");
	var popupBox = document.getElementById("popupFrame");
	var missingInfoBox = document.getElementById("missingInfoBox");
	var missingEmail = document.getElementById("missingEmail");
	var missingFeedback = document.getElementById("missingFeedback");
	var closeMissingInfoBox = document.getElementById("closeMissingInfoBox")
	missingFeedback.innerText = "";
	missingEmail.innerText = "";
	closeMissingInfoBox.onclick = function () {
	    missingInfoBox.style.display = "none";
	}
	var x = document.forms["feedback"]["txtMessage"].value;
	if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(feedback.txtEmail.value)) {
	    if (x == null || x === "") {
	        missingInfoBox.style.display = "block";
	        missingFeedback.innerText = "Please enter your feedback in the message box.";
		}
		else {
			parent.postMessage("alldone$$" + feedback.txtMessage.value + "$$" + feedback.txtEmail.value, befrugalSiteSecure);
		}
	}
	else if (x == null || x === "") {
	    missingInfoBox.style.display = "block";
	    missingEmail.innerText = "Please enter a valid email address, e.g. jon@yahoo.com";
	    missingFeedback.innerText = "Please enter your feedback in the message box.";
	}
	else {
	    missingInfoBox.style.display = "block";
	    missingEmail.innerText = "Please enter a valid email address, e.g. jon@yahoo.com";
	}
}

function sendToRate() {
    if (window.navigator.userAgent.match(/Firefox\/([0-9]+)\./)) {
        window.open("https://addons.mozilla.org/en-US/firefox/addon/befrugal-automatic-coupons/", "_blank");
        windowClose("Rating");
    }
    else {
        window.open("https://chrome.google.com/webstore/detail/befrugal/" + chrome.runtime.id + "/reviews", "_blank");
        windowClose("Rating");
    }
}

//poly-fill not quite poly-filling
class ResizeObserver2 {
    constructor(callback) {
        this.observables = [];
        // Array of observed elements that looks like this:
        // [{
        //   el: domNode,
        //   size: {height: x, width: y}
        // }]
        this.boundCheck = this.check.bind(this);
        this.boundCheck();
        this.callback = callback;
    }

    observe(el) {
        if (this.observables.some((observable) => observable.el === el)) {
            return;
        }
        const newObservable = {
            el: el,
            size: {
                height: el.clientHeight,
                width: el.clientWidth
            }
        }
        this.observables.push(newObservable);
    }

    unobserve(el) {
        this.observables = this.observables.filter((obj) => obj.el !== el);
    }

    disconnect() {
        this.observables = [];
    }

    check() {
        const changedEntries = this.observables.filter((obj) => {
            const currentHeight = obj.el.clientHeight;
            const currentWidth = obj.el.clientWidth;
            if (obj.size.height !== currentHeight || obj.size.width !== currentWidth) {
                obj.size.height = currentHeight;
                obj.size.width = currentWidth;
                return true;
            }
        }).map((obj) => obj.el);
        if (changedEntries.length > 0) {
            this.callback(changedEntries);
        }
        window.requestAnimationFrame(this.boundCheck);
    }
}

if (typeof window.addEventListener != "undefined") {
    window.addEventListener("load", function() {
        let container = document.getElementsByClassName("container");
        container = container[0];
        function outputsize() {
            parent.window.postMessage("SIZE," + container.clientWidth + "," + container.clientHeight, befrugalSiteSecure);
        }
        if (typeof ResizeObserver == 'undefined') {
            //gives the page a bit to render on "report a problem"  :: T(reating)T(he)S(ymptom)N(ot)T(he)D(isease)
            //Magic timeout zero
            setTimeout(function () { outputsize(); }, 0);
            new ResizeObserver2(outputsize).observe(container);
        } else {
            new ResizeObserver(outputsize).observe(container);
        }
    });
}
