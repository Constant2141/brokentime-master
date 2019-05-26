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

router.post('/createPeriod', async function (req, res, next) {   //创建周期
    let openid = tools.getOpenid(req.body.skey)

    let newPeriod = new periodsModel({
        openid: openid,
        lastTime: req.body.lastTime,
        createDate:tools.getTime().date,
        createDay:tools.getTime().day
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

router.post('/createTable', async function (req, res, next) {  //创建日常时间 (要指定插入哪个周期)
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

router.post('/createBTable', async function (req, res, next) {  //创建破碎时间
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




// router.post('/comment', async function (req, res, next) {  //评分接口 (table_id,score)
//     let body = req.body;
//     let table_id = body.table_id;
//     let score = body.score;

//     btablesModel.findByIdAndUpdate(table_id, { $set: { score: score } }).then(data => {
//         res.json({
//             code: 200,
//             msg: '评价成功'
//         })
//     }).catch(err => {
//         res.json({
//             code: 500,
//             msg: err
//         })
//     })
// })

router.post('/comment',async function(req,res,next){
    let period_id = req.body.period_id;
    let arr = [25,50,25,100];
    let pe = await periodsModel.findById(period_id).then()

    res.json({
        data : pe
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
