var https = require("https");
var qs = require('querystring');  
var iconv = require("iconv-lite");  
var config = require('./config')
var tools = require('../tools')



const get_idKey = (url) => { //获取openid和session_key
        return new Promise((resolve,reject) => {
            https.get(url, function (res) {  
                var datas = [];  
                var size = 0;  
                res.on('data', function (data) {  
                    datas.push(data);  
                    size += data.length;  
                //process.stdout.write(data);  
                });  
                res.on("end", function () {  
                    var buff = Buffer.concat(datas, size);  
                    var result = iconv.decode(buff, "utf8");
                    resolve(result)
                });  
            }).on("error", function (err) {  
                Logger.error(err.stack)  
                callback.apply(null);  
                reject("sorry")
            });
        })
}


const get_skey = async function(code){//得到自定义登录态
    var data = {
        appid:config.appid,
        secret:config.secret,
        js_code:code,
        grant_type: config.grant_type
    }

    var qsdata = qs.stringify(data)
    var url = 'https://api.weixin.qq.com/sns/jscode2session?'+qsdata;
    
    return new Promise((resolve,reject) => {
        get_idKey(url).then((data) =>{
            resolve(tools.aesEncrypt(data));
            reject(new Error('error'))
         })
    }).catch(err => {
        console.log(err);
    })
}

module.exports = {
    get_skey
}