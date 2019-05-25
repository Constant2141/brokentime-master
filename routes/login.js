var express = require('express');
var router = express.Router();
const auth = require('../tools/wx/auth');
const models = require('../tools/db')
const tools = require('../tools/tools')

var { usersModel} = models;



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
                    newUser.save().then(doc => {
                        res.json({
                            code: 200,
                            msg: '新用户',
                            flag: 0,
                            skey: skey
                        })
                    }).catch(err =>{
                        res.json({
                            code:500,
                            msg:err
                        })
                    })
                } else {
                    console.log('老用户');
                    usersModel.updateOne({ openid: openid }, { $set: { flag: 1 } }).then(doc => {
                        res.json({
                            code:200,
                            msg:'老用户',
                            flag:1,
                            skey:skey
                        })
                    }).catch(err => {
                        res.json({
                            code:500,
                            msg:'出错了'
                        })
                    })
                }
            })
    }

})


module.exports = router;
