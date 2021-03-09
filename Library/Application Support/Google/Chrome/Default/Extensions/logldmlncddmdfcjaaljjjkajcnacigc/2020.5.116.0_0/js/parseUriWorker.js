importScripts('parseUri.js');
onmessage = function (event) {
    var results = [];
    for (var i = 0; i < event.data.length; ++i) {
        results.push(parseUriWrapper.CleanUrl(event.data[i]));
    }
    postMessage(results);
};