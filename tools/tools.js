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
    let session_id = JSON.parse(aesDecrypt(skey));
    return session_id.openid;
}


function getNextSequenceValue(model, sequenceName) {//数据库自增标志
    return new Promise((resolve, reject) => {
        model.findOneAndUpdate({ _id: sequenceName }, { $inc: { sequence_value: 1 } }, { new: true }, function (err, doc) {
            if (err) reject(err)
            else resolve(doc.sequence_value);
        }
        )
    }).catch(err => {
        console.log(err);
    })
}
// await tools.getNextSequenceValue(countersModel, 'periodid'),
module.exports = {
    aesEncrypt,
    aesDecrypt,
    getOpenid,
    getNextSequenceValue
}