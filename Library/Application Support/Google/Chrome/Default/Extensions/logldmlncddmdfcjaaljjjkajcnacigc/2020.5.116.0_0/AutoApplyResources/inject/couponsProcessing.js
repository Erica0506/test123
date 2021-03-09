var reportProblem = document.getElementById("bfrl_reportProblem");

window.addEventListener("DOMContentLoaded", function (event) {
    reportProblem.addEventListener("click", function () {
        chrome.runtime.sendMessage({
            targetScript: "autoApplyApp.js",
            action: "iframeReportSetURL",
            data: "AutoApplyResources/report/reportProblem.html"
        }, function () {
            if (chrome.runtime.lastError) {
                console.debug(chrome.runtime.lastError.message);
            }
        });
    });
});