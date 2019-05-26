var express = require('express');
var router = express.Router();
const auth = require('../tools/wx/auth');
const models = require('../tools/db')
const tools = require('../tools/tools')

var { usersModel, periodsModel, tablesModel, btablesModel } = models;


router.use(function (req, res, next) {  //统一判断请求中是否有登录态标识
    let skey = req.body.skey || req.query.skey
    if (!skey) {
        res.json({
            code: 400,
            msg: "没有携带skey"
        })
    }
    next();
})

router.post('/createPeriod', async function (req, res, next) {   //创建周期(lastTime)
    let openid = tools.getOpenid(req.body.skey)

    let newPeriod = new periodsModel({
        openid: openid,
        lastTime: req.body.lastTime,
        createDate: tools.getNowTime().date,
        createDay: tools.getNowTime().day,
        endDay: tools.getEndTime(req.body.lastTime)

    })

    newPeriod.save().then(pe => {
        return Promise.all([usersModel.findOne({ openid: openid }), pe])
    }).spread((user, pe) => {
        user.periods.push(pe);
        user.save()
    }).then(
        res.json({
            code: 200,
            msg: '创建周期成功'
        })
    ).catch(err => {
        res.json({
            code: 500,
            msg: "创建周期失败"
        })
    })
})

router.post('/createTable', async function (req, res, next) {  //创建日常时间 (period_id)
    let openid = tools.getOpenid(req.body.skey)
    let body = req.body
    let newTable = new tablesModel({
        openid: openid,
        timeStart: body.timeStart,
        timeEnd: body.timeEnd,
        affair: body.affair
    })
    newTable.save().then(ta => {
        return Promise.all([periodsModel.findById(body.period_id), ta])
    }).spread((pe, ta) => {
        pe.tables.push(ta);
        pe.save()
    }).then(
        res.json({
            code: 200,
            msg: '日程表创建成功'
        })
    ).catch(err => {
        res.json({
            code: 500,
            msg: '日程表创建失败'
        })
    })
})

router.post('/createBTable', async function (req, res, next) {  //创建破碎时间(period_id)
    let openid = tools.getOpenid(req.body.skey)
    let body = req.body
    let newbTable = new btablesModel({
        openid: openid,
        timeStart: body.timeStart,
        timeEnd: body.timeEnd,
        affair: body.affair
    })

    newbTable.save().then(bta => {
        return Promise.all([periodsModel.findById(body.period_id), bta])
    }).spread((pe, bta) => {
        pe.btables.push(bta);
        pe.save()
    }).then(
        res.json({
            code: 200,
            msg: '破碎表创建成功'
        })
    ).catch(err => {
        res.json({
            code: 500,
            msg: '破碎表创建失败'
        })
    })
})



router.post('/comment', async function (req, res, next) { //评分接口  (period_id,评分数组)
    let period_id = req.body.period_id;
    let arr = req.body.arr; //模拟前端发送的对每个破碎时间的评分数组
    // let arr = [ 20,40]
    let pe = await periodsModel.findById(period_id).populate('btables', '')
        .exec()
        .then()
        .catch(err => {
            console.log(err);
        })

    var totalTime = 0; //记录总的破碎时间长度
    var effectTime = 0;
    let result =  pe.btables.map(async function (item, index) {
        let bta = await btablesModel.findByIdAndUpdate(item._id, { $set: { score: arr[index] } })
            .then()
            .catch(err => {
                console.log(err);
            })

        let during = tools.getDuring(bta.timeStart, bta.timeEnd);

        effectTime += during * item.score * 1 / 100;
        totalTime += during


        if (index == pe.btables.length - 1) {

            let finalScore = (effectTime * 1.0 / totalTime) * 100
            console.log('有效利用时间' + effectTime);
            console.log("总的破碎时间" + totalTime);
            console.log('该周期的最后评分为' + finalScore);
            periodsModel.findByIdAndUpdate(period_id, { $set: { score: finalScore } })
                .then(doc => {
                    console.log(doc)
                    res.json({
                        code: 200,
                        msg: '该周期最后总分为' + finalScore
                    })
                }
                ).catch(err => {
                    res.json({
                        code: 500,
                        msg: '不可描述的意外发生了'
                    })
                })
        }
    })
})

router.post('/calc', async function (req, res, next) {  //计算破碎时间  (period_id)
    var array = [];

    let arr = await periodsModel.findById(req.body.period_id).populate('tables', 'timeStart timeEnd  affair -_id')
        .exec()
        .then(doc => {
            return doc.tables
        })
    for (let i = 0, len = arr.length; i < len - 1; i++) {
        let tap = arr[i].timeEnd + '-' + arr[i + 1].timeStart
        array.push(tap)
    }
    res.json({
        data: array
    })
})


router.post('/getTable', async function (req, res, next) {   //获取这个周期的创建过的所有信息 （period_id）
    let period_id = req.body.period_id;

    periodsModel.findById(period_id, {}).populate('tables btables', 'timeStart timeEnd  affair isFinish  score -_id')
        // .sort({timeStart:-1})
        .exec().then(pe => {
            res.json({
                code: 200,
                data: pe
            })
        }).catch(err => {
            res.json({
                code: 500,
                msg: err
            })
        })
})
router.post('/history',async function(req, res, next){
    let skey = req.body.skey;
    let openid = tools.getOpenid(skey)
    let periodsID = [];
    let periods = [];

    await usersModel.findOne({ openid: openid }).then(doc => {
        periodsID = doc.periods
    })
    .then(()=>{
        periodsID.forEach((val,idx) => {
           periodsModel.findById(val,{}).populate('tables btables', 'timeStart timeEnd  affair isFinish  score -_id')
           .exec()
           .then(data => {
                periods.push(data);
                if(idx == periodsID.length-1){
                    res.json({
                        code:200,
                        data:periods
                    })
                }
           })
        })
    })
    .catch(err => {
        res.json({
            code: 500,
            msg: "periods "+err
        })
    })
})

module.exports = router;
