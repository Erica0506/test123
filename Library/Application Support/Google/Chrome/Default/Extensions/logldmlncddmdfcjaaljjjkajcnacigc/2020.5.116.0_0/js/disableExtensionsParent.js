//NOTE(Thompson): Child documents have access to parent documents.
//children will invoke JS functions that resides here.

var dstool = chrome.extension.getBackgroundPage().DisableSystem;
var sptool = chrome.extension.getBackgroundPage().shoptoolbar;

//we have access to the background scripts- no need for messaging.
//This will run, even without DOM content loading event.

if (sptool.disablePageDataPoint) {
    dstool.OpenDialog(sptool.disablePageDataPoint, false);
    sptool.disablePageDataPoint = null;
} else {
    dstool.OpenDialog({
        newWidth: 400,
        newHeight: 320,
        newURL: "disable/disable_page1.html?localparent=1"
    }, false);
}

//NOTE(Thompson): This is for the iframes.
function _BlankSendMessage(target, action, alldata, callback) {
	chrome.runtime.sendMessage({
		targetScript: target,
		action: action,
		data: alldata
	}, function (results) {
		callback(results);
	});
}

function closeTab() {
	chrome.tabs.getCurrent(function (tab) {
		chrome.tabs.remove(tab.id, function () { });
	});
}
