
// 监听popup.js发来的消息
chrome.runtime.onMessage.addListener((message, callback) => {
    console.log(`🚀 -> [content-script] ✉️received message from [${message?.from}]`, message);
    if (message) {
        localStorage.setItem(message.id, JSON.stringify(message.specUrl))
        window.open(`${message.dirUrl}/redoc.html?d=${message.date}&q=${message.id}`, '_blank', '');
    }
});
// 发送信息
chrome.runtime.sendMessage({ url: `${location.origin}/v2/api-docs`, from: 'content-script'},(response) => {
        console.log('🚀 -> [content-script] ✉️send message, response', response);
    });
