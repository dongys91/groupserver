// 引入express模块
const express = require('express');
const server = express();
// 引入cors模块
const cors = require('cors')
// 引入mysql模块
const mysql = require('mysql');
// 引入body-parser中间件
const bodyPaser = require('body-parser')
// 引入md5模块
const md5 = require('md5')
// 创建连接池并配置
const pool = mysql .createPool({
  // mysql数据库服务器地址
  host:'127.0.0.1',
  // 端口号
  port:3306,
  // 数据库用户的用户名
  user:'root',
  // 数据库用户的密码
  password:'',
  // 数据库名称
  database:'cb',
  // 最大连接数
  connectionLimit:15
});
// 使用body-parser中间件
server.use(bodyPaser.urlencoded({
  extended:false
}));
// 使用cors解决跨域问题
server.use(cors({
  origin:['http://127.0.0.1:8080','http://localhost:8080']
}));
//服务器监听接口
server.listen(3000,()=>{
  console.log('server is runing...')
});
// home页面轮播图接口
server.get('/carousel',(req,res)=>{
  let sql = 'SELECT img,cid,href from cb_index_carousel';
  pool.query(sql,(err,results)=>{
    
    res.send({message:'查询成功',code:1,results})
  })
});
// 用户注册接口
server.post('/register',(req,res)=>{
  // 获取客户端用户的用户名和密码
  let username=req.body.username;
  let password=req.body.password;
  // console.log(username,password)
  // 查询用户名是否存在
  let sql = 'SELECT uid FROM cb_user WHERE username=?';
  // 执行sql语句
  pool.query(sql,[username],(err,results)=>{
    if(err) throw err;
    // 如果查询到的结果长度为0，说明数据库中不存在，就可以进行注册，进行插入到数据库
    if(results.length==0){
      // 将用户输入的用户名和密码，插入到数据库中
      sql = 'INSERT cb_user(username,password) VALUES(?,MD5(?))';
      // 执行sql命令，此时在客户端注册，数据库中可查询到用户名和密码
      pool.query(sql,[username,password],(error,results)=>{
        if(error) throw error;
        // 产生注册成功的信息到客户端
        res.send({message:'注册成功',code:1})
      });
    } else {
      //产生合理的错误信息到客户端
      res.send({message:'注册失败',code:0})
    }
  })
});
server.post('/login',(req,res)=>{
  // 获取用户输入的用户名和密码
  let username = req.body.username;
  let password = md5(req.body.password)
  // 以用户名和密码的条件进行查找
  // 如果找到，则代表用户登录成功
  // 否则代表用户登录失败
  sql = 'SELECT uid,username,nickname,avatar FROM cb_user WHERE username=? AND password=?';
  // 执行sql语句
  pool.query(sql,[username,password],(error,results)=>{
    if(error) throw error;
    // 如果用户名和密码同时找到，登录成功
    if(results.length==1){
      res.send({message:'登录成功',code:1,info:results[0]})
      // 否则登录失败
    }else{
      res.send({message:'登录失败',code:0})
    }
  })
});
// home页面商品列表接口
server.get('/list',(req,res)=>{
  let sql = 'SELECT pid,title,details,pic,price,href FROM cb_index_product';
  pool.query(sql,(err,results)=>{
    res.send({message:'查询成功',code:1,results})
    // console.log(results)
  })
})
// message页面信息获取
server.get('/message',(req,res)=>{
  let sql = 'SELECT mid,shop_name,msg,img FROM cb_message';
  pool.query(sql,(err,results)=>{
    res.send({message:'查询成功',code:1,results})
  })
});
// 商品购物车信息获取
server.get('/cart',(req,res)=>{
  let sql = 'SELECT sid,title,details,pic,price,is_checked,count FROM cb_index_shop';
  pool.query(sql,(err,results)=>{
    // console.log(results)
    res.send({message:'查询成功',code:1,results})
  })
})
//shopcart购物页面
server.get('/shopcart',(req,res)=>{
  //获取id
  let id=req.query.id;
  // console.log(id)
  let sql='SELECT imagea,imageb, title,subtitle,uprice,promise,spec from cb_textile where lid=?';
  // console.log(sql)
  //执行SQL语句
  pool.query(sql,[id],(err,results)=>{
    // console.log(results)
    res.send({message:'查询成功',code:1,result:results})
  })
});

//获取特定文章信息的APT接口
server.get('/details',(req,res)=>{
  let id = req.query.id;

  let sql = 'SELECT d.lid,d.imagea,d.imageb,d.imagec,d.imaged,d.imagee,d.imagef,d.title,d.subtitle,d.href,d.price,d.promise,d.spec,d.lname,d.category,d.sold_count FROM cb_index_product AS i INNER JOIN cb_textile AS d ON family_id = i.pid WHERE d.lid = ?';

  // 执行SQL语句
  pool.query(sql,[id],(err,result)=>{
    if (err)  throw err;
    res.send({message:'查询成功',code:1,result:result[0]})
  });
});
