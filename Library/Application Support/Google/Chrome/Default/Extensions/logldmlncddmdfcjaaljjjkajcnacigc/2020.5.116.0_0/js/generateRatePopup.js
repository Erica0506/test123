var startX;
var startY;
var curW;
var curH;
var divHeight = document.body.clientHeight;
var divWidth = document.body.clientWidth;

for (let i = 0; i < document.body.childNodes.length; i++) {
	var curNode = document.body.childNodes[i];
	if (curNode.style && curNode.id !== "modal-overlay") {
		if (curNode.id === "page") {
			divHeight = curNode.clientHeight;
			divWidth = curNode.clientWidth;
		}
		curNode.style.zIndex = 1;
		curNode.style.position = "relative";
	}
}

let dvpopup = document.createElement("div");
dvpopup.id = "popupDiv";
dvpopup.style = "height:100%;width:100%;z-index:1000;position:fixed;top:0px;left:0px;display:none;background:rgba(50,50,50,0.7)";
let iframepop = document.createElement("iframe");
iframepop.id = "popupFrame";
iframepop.src = chrome.extension.getURL("ratepopup/popup-loveus.html");
iframepop.style = "display = block;margin: 5% auto;";
dvpopup.appendChild(iframepop);
document.body.insertAdjacentElement("afterbegin", dvpopup);

//Firefox doesn't seem to notice what's going on in a hidden div, so we wait x seconds and set the div to block anyways.
setTimeout(function () {
    document.getElementById('popupDiv').style.display='block';
},1000);


window.addEventListener("message", function(event) {
	if (event.data === "close") {
		dvpopup.parentNode.removeChild(dvpopup);
	}
	else if (event.data.indexOf("alldone") !== -1) {
		var dataSplit = event.data.split("$$");
		var feedback = "User Token: " + userToken;
		feedback += "    User Message: " + dataSplit[1];
		var userEmail = dataSplit[2];
		userEmail = "[" + toolbarVersion + "] " + userEmail;

		let iframeAllDone = document.createElement("iframe");
		iframeAllDone.id = "popupFrameAllDone";
		iframeAllDone.src = chrome.extension.getURL("ratepopup/popup-alldone.html");
		iframeAllDone.style = "position: fixed;top: 17px;left: 483px;width: 571px;height: 668px;";
		document.getElementById("popupDiv").appendChild(iframeAllDone);
		dvpopup.removeChild(iframepop);

		var uri = 'https://www.befrugal.com/toolbar/toolbarWS/ws.asmx/SendFeedbackEmail?toolbarversion=' + toolbarVersion + '&email=' + userEmail + '&body=' + feedback;
		var encodedURI = encodeURI(uri);
		var httpReq = new XMLHttpRequest();
		httpReq.open("GET", encodedURI);
		httpReq.onload = function(e) {
			//console.log(httpReq.responseXML);
		};
		try {
			httpReq.overrideMimeType("application/xml");
		}
		catch (e) {}
		try {
			httpReq.send(null);
		}
		catch (e) {}
	}
	else if (event.data.startsWith("setPref")) {
		chrome.runtime.sendMessage("kcdcneeneoifbeenbbnjodcflhdbaggp", event.data);
		chrome.runtime.sendMessage("nlnfijkcnmdgbdeomehkhhlonpffgfbj", event.data);
	}
	else {
	    var args = event.data.split(",");
	    if (args.length === 3 && args[0] === "SIZE") {
		    var frame = document.getElementById("popupFrame");
			if (frame) {
				frame.width = (args[1] * 1) + 6 + "px";
				frame.height = (args[2] * 1) + 6;+"px"
				frame.style.display = "block";
				frame.style.margin = "margin: 5% auto;"
				document.getElementById("popupDiv").style.display = "block";
			}
		}
	}
});


