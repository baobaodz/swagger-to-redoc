
function consoleLog(msg) {
    console.log('[content-script] ', msg)
}
consoleLog('aha')
chrome.runtime.onMessage.addListener((message, callback) => {
    console.log('🚀 -> [content-script] chrome.runtime.onMessage.addListener -> message', message);
    if(message){
        localStorage.setItem(message.id, JSON.stringify(message.specUrl))
        window.open(`${message.dirUrl}/redoc.html?d=${message.date}&q=${message.id}`, '_blank', '');
    }
});
// 发送信息
chrome.runtime.sendMessage({ url: `${location.origin}/v2/api-docs` }, (response) => {
    console.log('🚀 -> [content-script] chrome.runtime.sendMessage -> response', response);
});
