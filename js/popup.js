
var swaggerUrl;


$('#start').on("click", function () {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('request: ', request);
        swaggerUrl = request.url;
    });
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
        console.log('🚀 -> tabs XX', tabs[0].url);
        alert(tabs[0].url)
        var regx = /^http(s)?:\/\/(.*?)\//
        var rs = regx.exec(tabs[0].url)
        if (rs.length) {
            swaggerUrl = rs[0] + 'v2/api-docs';
        }
        alert(swaggerUrl)
        // return;
        getdDoc(swaggerUrl);
    });


});
function saveAs(data, fileName) { // data: 要保存的数据; name: 文件名称

    // 创建一个a标签
    const aLink = document.createElement("a");
    // 生成一个blob二进制数据，内容为json数据
    const blob = new Blob([data], { type: "text/plain;charset=utf-8" });
    // 生成一个指向blob的URL地址，并赋值给a标签的href属性
    aLink.setAttribute('href', window.URL.createObjectURL(blob));
    // 定义生成文件的文件名及后缀名
    aLink.setAttribute('download', fileName);
    // Dom文档Body里生成一个a标签
    document.body.appendChild(aLink);
    // 模拟点击a标签
    aLink.click()
    // 移去a标签
    document.body.removeChild(aLink);
}

// L7bRFs7dxn2-QT_FS86p7QQMpHWlJNndz9qHHm-G:_1oK1ei33Qq3ZlsO0JzKc2toLoQ=:eyJzY29wZSI6ImJhb2Jhb2R6OiIsImRlYWRsaW5lIjoxMDE2NTk2Nzg3MDN9
function uploadFile(file, filename) {

    const token = "L7bRFs7dxn2-QT_FS86p7QQMpHWlJNndz9qHHm-G:_1oK1ei33Qq3ZlsO0JzKc2toLoQ=:eyJzY29wZSI6ImJhb2Jhb2R6OiIsImRlYWRsaW5lIjoxMDE2NTk2Nzg3MDN9";

    // z1华北 z2 华南
    let config = {
        useCdnDomain: true,
        region: qiniu.region.z0
    };
    let putExtra = {
        fname: "",
        params: {},
        mimeType: null
    };

    console.log(1111111111)
    let subscription;
    // 调用sdk上传接口获得相应的observable，控制上传和暂停
    let observable = qiniu.upload(file, '', token, putExtra, config);
    let observer = {
        next(result) {                        //上传中(result参数带有total字段的 object，包含loaded、total、percent三个属性)
            let total = result.total;
            console.log('total: ', total)
            $(".speed").text("进度：" + total.percent + "% ");//查看进度[loaded:已上传大小(字节);total:本次上传总大小;percent:当前上传进度(0-100)]
            if (total.percent === 100) {
                window.open('https://document.baobaodz.top/plugin/redoc.html', 'newwindow', '')
            }
        },
        error(err) {
            console.log(err)                       //失败后
            alert(err.message);
        },
        complete(res) {
            console.log(res)                   //成功后
            // ?imageView2/2/h/100：展示缩略图，不加显示原图
            // ?vframe/jpg/offset/0/w/480/h/360：用于获取视频截图的后缀，0：秒，w：宽，h：高
        }
    }
    // 取消上传
    // subscription.unsubscribe();
    observable.subscribe(observer)
}

function getdDoc(url) {
    alert('getdDoc -> swaggerUrl: ' + url);
    $.ajax({
        url: url,
        type: 'GET',
        contentType: "application/json",
        success: function (res, _res) {
            alert('getdDoc -> res: ' + res);
            console.log('res: ', res)
            saveAs(JSON.stringify(res), "save.json");
            const blob = new Blob([JSON.stringify(res)], { type: "text/plain;charset=utf-8" });
            uploadFile(blob, "save.json")
        }
    })
}