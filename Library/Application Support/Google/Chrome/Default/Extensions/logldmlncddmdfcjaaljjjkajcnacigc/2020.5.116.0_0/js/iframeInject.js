var prevScroll = 0;

function IsEdgium() {
    let hasUserAgent = typeof window !== 'undefined' && typeof window.navigator !== 'undefined' && typeof window.navigator.userAgent !== 'undefined';
    return (hasUserAgent && window && window.Navigator && window.navigator.userAgent && /edg/i.test(window.navigator.userAgent));
}

document.body.style.minHeight = "100%";
document.body.style.width = "100%";
document.body.style.position = "fixed";

if (!document.getElementById("installPopupOverlay")) {
    let divinstallPopupOverlay = document.createElement('div');
    divinstallPopupOverlay.id = "installPopupOverlay";
    divinstallPopupOverlay.style = "z-index:10000;top:0;left:0;bottom:0;right:0;position:absolute;background-color:rgba(0, 0, 0, 0.85)";
    divinstallPopupOverlay.onclick = function () {
        document.getElementById("installPopupOverlay").style.display = "none";
        document.getElementById("popupArrow").style.display = "none";
        document.getElementById("overlayTextArea").style.display = "none";
        document.body.style.position = "";
    }
    document.body.appendChild(divinstallPopupOverlay);
}

if (!document.getElementById("overlayTextArea")) {
    let textAreaOverlay = document.createElement('div');
    textAreaOverlay.id = "overlayTextArea";
    textAreaOverlay.style = "position:absolute;padding:30px;top:0;left:0;bottom:0;right:0;z-index:10001;";

    let rightStyle = IsEdgium() ? "275" : "180";
    let textAreaDiv = document.createElement('div');
    let textAreaImg = document.createElement('img');
    textAreaImg.id = "popupArrow";
    textAreaImg.style = "z-index:100000;position:absolute;right:" + rightStyle + "px;top:40px;width:815px;height:430px;";
    textAreaImg.src = chrome.extension.getURL("chrome-arrow-small.png");
    textAreaDiv.appendChild(textAreaImg);
    textAreaOverlay.appendChild(textAreaDiv);
    textAreaOverlay.onclick = function () {
        document.getElementById("installPopupOverlay").style.display = "none";
        document.getElementById("popupArrow").style.display = "none";
        document.getElementById("overlayTextArea").style.display = "none";
        document.body.style.position = "";
    }
    document.body.appendChild(textAreaOverlay);
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
      if (request.instruction == "HideOverlay") {
        document.getElementById("installPopupOverlay").style.display = "none";
        document.getElementById("popupArrow").style.display = "none";
        document.getElementById("overlayTextArea").style.display = "none";
        document.body.style.position = "";
    }
  });