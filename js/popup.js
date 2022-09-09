
/** swagger 地址 */
var swaggerUrl;

/** 上传的可key/文件名 */
var key = '';

/** 七牛云AccessKey */
const accessKey = "xxxxxxxxxxxxxxxxxxxxxxxxx";

/** 七牛云SecretKey */
const secretKey = "xxxxxxxxxxxxxxxxxxxxxxxxx";

/** 七牛云存储空间名 */
const bucket = "baobaodz";

/** 七牛云外链域名 */
const baseUrl = "https://document.baobaodz.top";

/** 七牛云存储目录名 */
const pluginDir = "plugin";


/** 日期作为目录，方便后期维护 */
const today = formatDate(new Date(), "yyyyMMdd");

/** 上传的时间戳，也作为文件名使用 */
var timeStemp;

var qiniuInfo = {
    accessKey: '',
    secretKey: '',
    bucket: '',
    baseUrl: '',
    pluginDir: 'plugin',
}

listenForm();
$(`input[name="pluginDir"]`).val(pluginDir);
$('#start').on("click", function () {

    const rem = $(`input[name="remember"]`).value
    console.log('🚀 -> rem', rem);
    if (validateForm()) {
        setQiniuInfo();

        return;
        // chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        //     console.log('request: ', request);
        //     swaggerUrl = request.url;
        // });
        // chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
        //     console.log('🚀 -> tabs XX', tabs[0].url);
        //     alert(tabs[0].url)
        //     let regx = /^(.+(?=swagger))/;
        //     let rs = regx.exec(tabs[0].url);
        //     console.log('🚀 -> rs', rs);
        //     if (rs.length) {
        //         swaggerUrl = `${rs[0]}v2/api-docs`;
        //     }
        //     // return;
        //     getdApiDocs(swaggerUrl);
        // });
    }

});

function validateForm() {

    const formControls = $('.form-control');
    console.log('🚀 -> validateForm -> formControls', formControls);
    for (let element of formControls) {
        console.log(element);
        const name = element.name;
        console.log('🚀 -> validateForm -> element', element);
        console.log('🚀 -> validateForm -> element.value', element.value);
        validate(element, name);
    }
    console.log('🚀 -> validateForm -> length', $('.message error').length);
    return $('.message.error').length === 0;
}
function listenForm() {
    const formControls = $('.form-control');
    for (let element of formControls) {
        const name = element.name;
        $(`input[name=${name}]`).bind('input propertychange change', function () {
            validate(element, name);
        })
    }
}
function validate(element, name) {
    const msg = $(`input[name=${name}]`).next();
    if (name === 'accessKey' || name === 'secretKey' || name === 'bucket') {
        if (!element.value.trim()) {
            msg.text(element.placeholder);
            msg.addClass('error');
        } else {
            msg.text('');
            msg.removeClass('error');
        }
    } else if (name === 'baseUrl') {
        let reg = /^(?=^.{3,255}$)(http(s)?:\/\/)?(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+(:\d+)*(\/\w+\.\w+)*$/;
        if (!element.value.trim()) {
            msg.text(element.placeholder);
            msg.addClass('error');
        } else if (!reg.test(element.value.trim())) {
            msg.text('格式');
            msg.addClass('error');
        } else {
            msg.text('');
            msg.removeClass('error');
        }
    } else if (name === 'pluginDir') {
        // !element.value.trim() ? msg.text(element.placeholder) : msg.text('');
    }
}
function setQiniuInfo(){
    var d = {};
    var t = $('form').serializeArray();
    console.log('🚀 -> setQiniuInfo -> t', t);
    console.log($("form").serialize());
    $.each(t, function() {
      d[this.name] = this.value;
    });
    qiniuInfo = d;
    console.log('🚀 -> setQiniuInfo -> qiniuInfo', qiniuInfo);
}
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

    timeStemp = Math.round(new Date().getTime() / 1000);
    const key = `${qiniuInfo.pluginDir}/${today}/${timeStemp}.json`;

    const token = generateToken(key);
    console.log('🚀 -> uploadFile -> token', token);
    console.log('🚀 -> uploadFile -> key', key);
    // z0华东 z1华北 z2华南
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
        },
        error(err) {
            console.log('🚀 -> upload error -> err', err);
            alert(err.message);
        },
        complete(res) {
            console.log('🚀 -> upload complete -> res', res);
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                console.log('🚀 -> [popup] tabs vvvvvv', tabs[0].url);
                const message = {
                    id: timeStemp,
                    date: today,
                    specUrl: `${qiniuInfo.baseUrl}/${res.key}`,
                    dirUrl: `${qiniuInfo.baseUrl}/${qiniuInfo.pluginDir}`
                }
                chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
                    console.log('🚀 -> [popup] chrome.tabs.sendMessage -> response 222', response);
                    // window.open(`https://document.baobaodz.top/plugin/redoc.html?q=${timeStemp}`, 'newwindow', '');
                });
            })
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
            console.log('🚀 -> getdDoc -> res', res);
            // saveAs(JSON.stringify(res), "save.json");
            const blob = new Blob([JSON.stringify(res)], { type: "text/plain;charset=utf-8" });
            uploadFile(blob);
        }
    })
}
/**
 * 生成上传七牛云的token
 * @param {string} key 全路径文件
 * @returns 上传token
 */
function generateToken(key) {

    let putPolicy = {};
    putPolicy.scope = `${qiniuInfo.bucket}:${key}`;
    putPolicy.deadline = timeStemp + 36000;//必须是数值类型非字符串
    // 将上传策略序列化成为JSON
    let put_policy = JSON.stringify(putPolicy);
    // 对 JSON 编码的上传策略进行URL 安全的 Base64 编码，得到待签名字符串
    let encoded = tokentool.base64encode(tokentool.utf16to8(put_policy));
    // 使用访问密钥（AK/SK）对上一步生成的待签名字符串计算HMAC-SHA1签名
    let hash = CryptoJS.HmacSHA1(encoded, qiniuInfo.secretKey);
    // 对签名进行URL安全的Base64编码
    let encodedSigned = hash.toString(CryptoJS.enc.Base64);
    // 将访问密钥（AK/SK）、encodedSign 和 encodedPutPolicy 用英文符号:连接起来
    let token = `${qiniuInfo.accessKey}:${tokentool.safe64(encodedSigned)}:${encoded}`;
    return token;
}
