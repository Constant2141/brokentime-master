const mongoose = require('./connect');
var Schema = mongoose.Schema;
var schemas = {};

schemas.users = new Schema({ //用户信息集合
    openid: {//用户唯一标志
        type: String,
        required: true
    },
    flag: {//判断是否是第一次使用小程序，0表示否，登录过后改为1
        type: String,
        default: 0
    },
    periods: [{ type: Schema.Types.ObjectId, ref: 'periods' }]
});

schemas.periods = new Schema({ //周期集合
    openid:{
        type: String,
        required: true,
    },
    lastTime: {//周期持续时间
        type: String,
        required: true
    },
    createDate:{
        type:String,
        required:true
    },
    createDay:{
        type:String,
        required:true
    },
    tables: [{ type: Schema.Types.ObjectId, ref: 'tables' }],
    btables: [{ type: Schema.Types.ObjectId, ref: 'btables' }]

})

schemas.tables = new Schema({  //日常时间集合
    openid:{
        type: String,
        required: true,
    },
    timeStart: { //开始时间
        type: String,
        default: Date.now,
        required: true
    },
    timeEnd: { //结束时间
        type: String,
        required: true
    },
    affair: {  //做的事情
        type: String,
        required: true
    },
})

schemas.btables = new Schema({  //破碎时间集合
    timeStart: {
        type: String,
        required: true
    },
    timeEnd: {
        type: String,
        required: true
    },
    affair: {
        type: String,
        required: true
    },
    isFinish: {//是否已经完成，默认是0未完成，时间到了则完成
        type: Boolean,
        default: 0
    },
    score: { //完成后对这个事件利用率的评价
        type: Number,
        default: 0
    },
})




schemas.counters = new Schema({ //计数器计数器 不用乱动
    _id: {
        type: {},
    },
    sequence_value: {
        type: {},
    },
})


module.exports = schemas;