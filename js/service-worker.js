
console.log('🚀 -> [service-worker] location.origin', location.origin);
// 发送信息
chrome.runtime.sendMessage({ url: location.origin + '/v2/api-docs', from: 'service-worker' }, (response) => {
    console.log('🚀 -> [service-worker] send message -> response', response);
});
chrome.runtime.onMessage.addListener((message, callback) => {
    console.log(`🚀 -> [service-worker] received message from [${message?.from}]`, message);
    chrome.tabs.query({ active: true }, tabs => {
        console.log('🚀 -> [service-worker] current active tab', tabs[0]);

    });
});
