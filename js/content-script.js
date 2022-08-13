
function consoleLog(msg) {
    console.log(msg)
}
consoleLog('aha')
chrome.runtime.onMessage.addListener((message, callback) => {
    const tabId = getForegroundTabId();
    if (message.data === "setAlarm") {
        chrome.alarms.create({ delayInMinutes: 5 })
    } else if (message.data === "runLogic") {
        chrome.scripting.executeScript({ file: 'logic.js', tabId });
    } else if (message.data === "changeColor") {
        chrome.scripting.executeScript(
            { func: () => document.body.style.backgroundColor = "orange", tabId });
    };
});
chrome.runtime.sendMessage({ from: "/js/content-script.js" }, (response) => {
    console.log("content script -> background infos have been sended2", response);
    const url = location.origin + '/v2/api-docs';
});
// 发送信息
chrome.runtime.sendMessage({ url: location.origin + '/v2/api-docs' }, (response) => {
    console.log(
        `content script -> popup infos have been received. response: ${response}`
    );
});