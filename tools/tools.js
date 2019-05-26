const crypto = require('crypto')
const config = require('./wx/config')

// function encrypto(data) {//hash加密
//     let sha1Result = crypto.createHash('sha1').update(data, 'utf8').digest('hex')
//     return sha1Result;
// }

function aesEncrypt(data) {  //加密
    const cipher = crypto.createCipher('aes192', config.password);
    var crypted = cipher.update(data, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function aesDecrypt(encrypted) { //解密
    const decipher = crypto.createDecipher('aes192', config.password);
    var decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}


function getOpenid(skey) { //通过skey 获取openid
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

function getNowTime() {  //获取当前时间，月日和星期几
    var myDate = new Date();
    let date = myDate.getMonth() + 1 + '.' + myDate.getDate()
    let day =myDate.getDay()
    if(day == 0 ) day = 7;
    return {
        date,//当前月日
        day//当前星期几
    };
}


function getEndTime(day){//传入一个持续时间，根据当前时间计算得到截止日期
    var start = new Date().getTime()  //当前时间的毫秒数
    var end = start + 3600000 * 24 * (day - 1);
    var result =  new Date(end).getMonth()+1+'.'+  new Date(end).getDate()
    return result
}


function getDuring(start,end) {  //传入开始时间和结束时间，计算得到间隔的分钟数，形式如7:30 8:00
    let  endarr =  end.split(':')
    let  startarr =  start.split(':')
    let during =  (endarr[0]*60+endarr[1]*1) - (startarr[0]*60+startarr[1]*1)
    return during
     
 }
 



module.exports = {
    aesEncrypt,
    aesDecrypt,
    getOpenid,
    getNextSequenceValue,
    getNowTime,
    getEndTime,
    getDuring
}