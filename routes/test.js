var express = require('express');
var router = express.Router();
const auth = require('../tools/wx/auth');
const models = require('../tools/db')
const tools = require('../tools/tools')
var { usersModel, periodsModel, tablesModel, btablesModel } = models;





router.post('/getUser', function (req, res, next) {
  let openid = tools.getOpenid(req.body.skey)
  usersModel.findById('5ce67dc914e88a2abc401598', { _id: 0, openid: 0 }).then(user => {
    res.json({
      msg: user
    })
  })
  // usersModel.findOne({openid:openid},{_id:0,openid:0}).populate('periods','lastTime')
  // .exec().then(user => {
  //   res.json({
  //     user:user
  //   })
  // }).catch(err =>{
  //   res.json({
  //     msg :err
  //   })
  // })



})

module.exports = router;
