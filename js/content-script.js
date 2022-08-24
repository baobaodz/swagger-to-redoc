
function consoleLog(msg) {
    console.log(msg)
}
consoleLog('aha')
chrome.runtime.onMessage.addListener((message, callback) => {
    console.log('🚀 -> chrome.runtime.onMessage.addListener -> message', message);
});
// 发送信息
chrome.runtime.sendMessage({ url: location.origin + '/v2/api-docs' }, (response) => {
    console.log('🚀 -> chrome.runtime.sendMessage -> response', response);
});