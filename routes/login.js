var express = require('express');
var router = express.Router();
const auth = require('../tools/wx/auth');
const models = require('../tools/db')
const tools = require('../tools/tools')

var { usersModel } = models;



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
                            flag: 0,
                            data:doc,
                            skey: skey
                        })
                    }).catch(err => {
                        res.json({
                            code: 500,
                            msg: err
                        })
                    })
                } else {
                    console.log('老用户');
                    usersModel.findOneAndUpdate({ openid: openid }, { $set: { flag: 1 } }).then(doc => {
                        res.json({
                            code: 200,
                            flag: 1,
                            data:doc,
                            skey: skey
                        })
                    }).catch(err => {
                        res.json({
                            code: 500,
                            msg: err
                        })
                    })
                }
            })
    }

})


module.exports = router;
