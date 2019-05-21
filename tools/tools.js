const crypto = require('crypto')
const config = require('./wx/config')

// function encrypto(data) {//hash加密
//     let sha1Result = crypto.createHash('sha1').update(data, 'utf8').digest('hex')
//     return sha1Result;
// }

function aesEncrypt(data) {
    const cipher = crypto.createCipher('aes192', config.password);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function aesDecrypt(encrypted) {
    const decipher = crypto.createDecipher('aes192', config.password);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}


function getOpenid(skey) {
    return new Promise((resolve,reject) =>{
        let session_id = JSON.parse(tools.aesDecrypt(skey));
        let openid = session_id.openid
        console.log('为什么调用不了');
        resolve(openid)
        reject('调用失败')
    })
    


}
module.exports = {
    aesEncrypt,
    aesDecrypt,
    getOpenid
}