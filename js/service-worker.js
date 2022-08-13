
// 发送信息
chrome.runtime.sendMessage({ url: location.origin + '/v2/api-docs' }, (response) => {
    console.log(
        `service-worker infos have been received. response: ${response}, url: ${location.origin}`
    );
});
console.log(location.origin)
chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    console.log('🚀 -> tabs vvvvvv', tabs[0].url);
    chrome.tabs.sendMessage({ url: tabs[0].url, }, (response) => {
        console.log(
            `service-worker -> content script infos have been received. number: ${response}`
        );
    });
});