const mongoose = require('./connect');
var Schema = mongoose.Schema;
var schemas = {};

schemas.users = new Schema({
    openid: {//姓名
        type: String,
        required: true
    },
    flag:{//判断是否是第一次使用小程序，0表示否，登录过后改为1
        type:Boolean,
        required:true,
        default:0
    }
});

schemas.periods = new Schema({
    openid: {//姓名
        type: String,
        required: true
    },
    period_id: {//周期编号
        type: String,
        required: true
    },
    lastTime: {//周期持续时间
        type:String,
        required: true
    }
})

schemas.tables = new Schema({
    openid: {//姓名
        type: String,
        required: true
    },
    period_id: {//周期编号
        type: String,
        required: true
    },
})



module.exports = schemas;