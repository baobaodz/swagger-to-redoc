
// 发送信息
chrome.runtime.sendMessage({ url: location.origin + '/v2/api-docs' }, (response) => {
    console.log('🚀 -> [service-worker] chrome.runtime.sendMessage -> response', response);
});
console.log(location.origin)
chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    console.log('🚀 -> [service-worker] tabs vvvvvv', tabs[0].url);
    chrome.tabs.sendMessage({ url: tabs[0].url, }, (response) => {
        console.log('🚀 -> [service-worker] chrome.tabs.sendMessage -> response 222', response);
    });
});
// 添加图标点击事件监听
chrome.action.onClicked.addListener(() => {
    console.log('1、点击了插件图标');
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
        console.log('2、🚀 -> tabs vvvvvv', tabs[0].url);
        chrome.tabs.sendMessage({ url: tabs[0].url, }, (response) => {
            console.log(
                `service-worker -> content script infos have been received. number: ${response}`
            );
        });
    });
});