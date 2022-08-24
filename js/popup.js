
/** swagger 地址 */
var swaggerUrl;
/** 上传的可key/文件名 */
var key;
/** AccessKey */
var accessKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
/** SecretKey */
var secretKey = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";


$('#start').on("click", function () {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('request: ', request);
        swaggerUrl = request.url;
    });
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
        console.log('🚀 -> tabs XX', tabs[0].url);
        alert(tabs[0].url)
        let regx = /^http(s)?:\/\/(.*?)\//;
        let rs = regx.exec(tabs[0].url);
        if (rs.length) {
            swaggerUrl = rs[0] + 'v2/api-docs';
        }
        alert(swaggerUrl);
        // return;
        getdApiDocs(swaggerUrl);
    });


});
/**
 * 保存文件
 * @param {string} data 要保存的数据
 * @param {string} fileName 文件名称
 */
function saveAs(data, fileName) {

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
    aLink.click();
    // 移去a标签
    document.body.removeChild(aLink);
}
/**
 * 上传文件到七牛云
 * @param {Blob} file 文件数据
 */
function uploadFile(file) {


    const token = generateToken();
    console.log('🚀 -> uploadFile -> token', token);
    console.log('🚀 -> uploadFile -> key', key);
    // z0华东 z1华北 z2 华南
    const config = {
        useCdnDomain: true,
        region: qiniu.region.z0
    };
    const putExtra = {
        fname: "",
        params: {},
        mimeType: null
    };

    // 调用sdk上传接口获得相应的observable，控制上传和暂停
    let observable = qiniu.upload(file, key, token, putExtra, config);
    let observer = {
        next(result) { // 上传中(result参数带有total字段的 object，包含loaded、total、percent三个属性)
            let total = result.total;
            console.log('🚀 -> upload next -> total', total);
            $(".speed").text("进度：" + total.percent + "% "); // 查看进度[loaded:已上传大小(字节);total:本次上传总大小;percent:当前上传进度(0-100)]
            if (total.percent === 100) {
                window.open('https://document.baobaodz.top/plugin/redoc.html', 'newwindow', '');
            }
        },
        error(err) {
            console.log('🚀 -> upload error -> err', err);
            alert(err.message);
        },
        complete(res) {
            console.log('🚀 -> upload complete -> res', res);
        }
    }
    observable.subscribe(observer);
}
/**
 * 获取swagger json数据
 * @param {string} url swagger doc地址
 */
function getdApiDocs(url) {
    alert('getdDoc -> swaggerUrl: ' + url);
    $.ajax({
        url: url,
        type: 'GET',
        contentType: "application/json",
        success: function (res, _res) {
            alert('getdDoc -> res: ' + res);
            console.log('🚀 -> getdDoc -> res', res);
            saveAs(JSON.stringify(res), "save.json");
            const blob = new Blob([JSON.stringify(res)], { type: "text/plain;charset=utf-8" });
            uploadFile(blob);
        }
    })
}
/**
 * 生成上传七牛云的token
 * @returns 上传token
 */
function generateToken() {

    const timestamp = Math.round(new Date().getTime() / 1000);
    key = formatDate(new Date(), "yyyy-MM-dd") + "/" + timestamp + ".json";
    let putPolicy = {};
    putPolicy.scope = "baobaodz" + ":" + key;
    putPolicy.deadline = timestamp + 36000;//必须是数值类型非字符串
    // 将上传策略序列化成为JSON
    let put_policy = JSON.stringify(putPolicy);
    // 对 JSON 编码的上传策略进行URL 安全的 Base64 编码，得到待签名字符串
    let encoded = tokentool.base64encode(tokentool.utf16to8(put_policy));
    // 使用访问密钥（AK/SK）对上一步生成的待签名字符串计算HMAC-SHA1签名
    let hash = CryptoJS.HmacSHA1(encoded, secretKey);
    // 对签名进行URL安全的Base64编码
    let encodedSigned = hash.toString(CryptoJS.enc.Base64);
    // 将访问密钥（AK/SK）、encodedSign 和 encodedPutPolicy 用英文符号:连接起来
    let uploadToken = accessKey + ":" + tokentool.safe64(encodedSigned) + ":" + encoded;
    return uploadToken;
}

function formatDate(date, fmt) {
    date = new Date(date);
    let o = {
        'M+': date.getMonth() + 1,               // 月份
        'd+': date.getDate(),                    // 日
        'h+': date.getHours(),                   // 小时
        'm+': date.getMinutes(),                 // 分
        's+': date.getSeconds(),                 // 秒
        'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
        'S': date.getMilliseconds()             // 毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (let k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
        }
    }
    return fmt;
};