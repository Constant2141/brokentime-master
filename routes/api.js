var express = require('express');
var router = express.Router();
const qs = require('querystring');
const auth = require('../tools/wx/auth');
const models = require('../tools/db')
const tools = require('../tools/tools')

var usersModel = models.usersModel;
router.get('/login', async function (req, res, next) {
    const code = await req.query.code;
    if (code) {
        let skey = await auth.get_skey(code);
        let session_id = JSON.parse(tools.aesDecrypt(skey));
        
        let oneUser = new usersModel({
            openid:session_id.openid
       })
       usersModel.findOne({openid:session_id.openid})
       .then(doc =>{
           if(!doc){
                oneUser.save().then(res =>{
                console.log('插入这个用户');
             })
           }else{
               console.log('已经存在这个用户');
           }
       })
       res.json({
           msg:'成功',
           skey:skey
       })
    }

})


router.post('/createPeriod',async function (req,res,next) {
    console.log(tools);
    
    let skey = req.body.skey;
    console.log(tools.getOpenid(skey));
    
    // console.log(skey);
    
    // let openid = tools.getOpenid(skey);
    // console.log(openid);

    res.json({
        openid:'abcd'
    })
    
})

module.exports = router;
