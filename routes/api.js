var express = require('express');
var router = express.Router();
const auth = require('../tools/wx/auth');
const models = require('../tools/db')
const tools = require('../tools/tools')

var { usersModel, periodsModel, tablesModel, countersModel, btablesModel } = models;

router.get('/login', async function (req, res, next) {     //登录态派发
    const code = await req.query.code;
    if (code) {
        let skey = await auth.get_skey(code);
        let openid = tools.getOpenid(skey)
        let newUser = new usersModel({
            openid: openid
        })
        usersModel.findOne({ openid: openid })
            .then(doc => {
                if (!doc) {
                    console.log('新用户');
                    newUser.save().then((err, doc) => {
                        if (err) res.json({
                            code: 500,
                            msg: '服务器出错'
                        })
                        else res.json({
                            code: 200,
                            msg: '新玩家',
                            flag: 0,
                            skey: skey
                        })
                    })
                } else {
                    console.log('老用户');
                    usersModel.updateOne({ openid: openid }, { $set: { flag: 1 } }, (err, doc) => {
                        if (err) res.json({
                            code: 500,
                            msg: '服务器出错'
                        })
                        else {
                            res.json({
                                code: 200,
                                msg: '老玩家',
                                flag: 1,
                                skey: skey
                            })
                        }
                    })
                }
            })
    }

})


router.post('/createPeriod', async function (req, res, next) {   //创建周期
    let openid = tools.getOpenid(req.body.skey)

    let newPeriod = new periodsModel({
        openid:openid,
        lastTime: req.body.lastTime
    })

    newPeriod.save().then(pe => {
        return Promise.all([usersModel.findOne({openid:openid}),pe])
    }).spread((user,pe) =>{
        user.periods.push(pe);
        user.save()
    }).then(
        res.json({
            msg:'创建成功'
        })
    ).catch(err => {
        console.log(err);
    })
})

router.post('/createTable', async function (req, res, next) {  //创建日常时间
    let openid = tools.getOpenid(req.body.skey)
    let body = req.body
    let newTable = new tablesModel({
        openid: openid,
        timeStart: body.timeStart,
        timeEnd: body.timeEnd,
        affair: body.affair
    })
    newTable.save().then(ta => {
        return Promise.all([periodsModel.findById(body.period_id),ta])
    }).spread((pe,ta) => {
        pe.tables.push(ta);
        pe.save()
    }).then(
        res.json({
            msg:'日程表创建成功'
        })
    ).catch(err => {
        res.json({
            msg:'日程表创建失败'
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
        return Promise.all([periodsModel.findById(body.period_id),bta])
    }).spread((pe,bta) => {
        pe.btables.push(bta);
        pe.save()
    }).then(
        res.json({
            msg:'破碎表创建成功'
        })
    ).catch(err => {
        res.json({
            msg:'破碎表创建失败'
        })
    })
})


router.post('/getTable', async function (req, res, next) {   //获取这个周期的大小时间
    let period_id = req.body.period_id;

    periodsModel.findById(period_id,{tables:1,btables:1}).populate('tables btables','timeStart timeEnd  affair isFinish  score -_id')
    .exec().then(pe => {
      res.json({
       data:pe
      })
    }).catch(err =>{
      res.json({
        msg :'出错'
      })
    })
})



router.post('/comment',async function(req,res,next){
    
})
module.exports = router;
