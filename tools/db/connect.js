const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/broken_time', { useNewUrlParser: true });//连接到数据库
mongoose.Promise = require('bluebird');
var connect = mongoose.connection;
connect.on("connected", function () {//监听connected事件
    // console.log("连接数据库成功");
});
connect.on("error", function () {//监听error事件
    console.log("连接数据库失败");
});
connect.on('disconnected', function () {//监听disconnected事件
    console.log('断开连接');
});
mongoose.set('useFindAndModify', false);




module.exports = mongoose;