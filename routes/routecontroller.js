require('promise')

var url = process.env.DB
var dbName = 'fcc'
var collThread = 'msg'
var collReply = 'reply'
var mongo=require('mongodb').MongoClient
var {ObjectId} = require('mongodb')

var log=function(msg){
  console.log(msg)
}


var populateNewThread=function(board) {
    var newRec ={}
    newRec.board = board
    newRec.text = ''
    newRec.created_on=(new Date).getTime()
    newRec.bumped_on=newRec.created_on
    newRec.reported=false
    newRec.delete_password=''
    return newRec
}

var populateNewReply=function(board,thread_id) {
  var newRec = {}
  newRec.board = board
  newRec.thread_id = thread_id
  newRec.text = ''
  newRec.created_on=(new Date).getTime()
  newRec.delete_password = ''
  newRec.reported=false
  return newRec
}

exports.gett=function(req,res){
  log('gett')
  var board = req.params.board
  var dbo
  mongo.connect(url).then(
    function(db){
      log('db')
      dbo=db.db(dbName)
      return dbo.collection(collThread).find( {board:board}).toArray()
      
      })
          //,{fields:{reported:false,delete_password:false}} )
        //.sort({bumped : -1}).limit(10).toArray()})
      .then(function(threads){
      // get top 3 replies
      log(threads)
      var doReplies = Promise.resolve()
      for (var thread of threads) {
        log('thread:'+thread._id)
        doReplies=doReplies.then(function(replyArray)
            {return dbo.collection(collReply)
              .find( {board:board,thread_id:thread._id},
              {fields:{reported:false,delete_password:false}} )
              .sort({created_on : -1}).limit(3).toArray()})
        .then(function(replyArray){
          thread.replies=replyArray
        })
      } 
    })
    .then(function(results) {
    res.send(results)
  })
  .catch(function(err) {
    log(err)
  })
}

    exports.postt=function (req, res){
      // create thread
      log('postt')
      var board = req.params.board
      var dbo
      mongo.connect(url)
        .then(function(db) {
        log('got db')
        dbo=db.db(dbName)
        var newThread = populateNewThread(board)
        newThread.text = req.body.text
        newThread.delete_password = req.body.delete_password
        dbo.collection(collThread).insert(newThread)
        .then(function() {             
          var path = '/b/'+board
          res.redirect(path)
        })
      }).catch(function(err){console.log(err)})
    }
    
    
    exports.putt=function (req, res){
      // report thread
      log('putt')
      var board = req.params.board
      var thread_id = req.thread_id
      var dbo
      mongo.connect(url).then(function(db) {
        dbo=db.db(dbName)
        return db.collection(collThread).findOne({_id:thread_id})})
      .then(function(){
        dbo.collection(collThread).update({_id:_id},thread)
          .then(function(count) {             
          res.send('success')
        })
      })  
      .catch(function (err) {console.log(err)})      
    }
    
    exports.deletet=function (req, res){
      log('deletet')
      // delete thread with password
      var board = req.params.board
      var dbo
      mongo.connect(url).then(function(db) {
        var newThread = populateNewThread(board)
        newThread.text = req.body.text
        newThread.delete_password = req.body.delete_password
        dbo = db.db(dbName)
        dbo.collection(collThread).update({_id:req.body._id},newThread)
          .then(function(count) {             
          var path = '/b/'+board
          res.redirect(path)
        }).catch(function (err) {
          //failure callback
          console.log(err)
        });  
      }).catch(function (err) {console.log(err)})      
      
    }
    
    exports.getr=function (req, res){
      log('getr')
      // show all replies on thread
      var board = req.params.board
      var dbo
      mongo.connect(url).then(function(db) {
        var newThread = populateNewThread(board)
        newThread.text = req.body.text
        newThread.delete_password = req.body.delete_password
        dbo = db.db(dbName)
        dbo.collection(collThread).update({_id:req.body._id},newThread)
          .then(function(count) {             
          var path = '/b/'+board
          res.redirect(path)
        }).catch(function (err) {
          //failure callback
          console.log(err)
        });  
      }).catch(function (err) {console.log(err)})      
    }
    
    exports.postr=function (req, res){
      log('postr')
      // create reply on thread
      var board = req.params.board
      var thread_id = req.params.thread_id
      var dbo
      // get thread first
      // bump thread
      // add array
      mongo.connect(url).then(function(db) {
        dbo=db.db(dbName)
        return dbo.collection(collThread).findOne( {board:board,_id:thread_id} )
      })
      .then(function(thread){
        var newReply = populateNewReply(thread.board,thread._id)
        newReply.text = req.body.text
        newReply.delete_password = req.body.delete_password
        dbo.collection(collReply).insert(newReply)
          .then(function() {             
          res.send('message')
        })
      }).catch(function (err) {console.log(err)})      
    }
    
    exports.putr=function (req, res){
      log('putr')
      // report reply on thread
      var board = req.params.board
      var thread_id=req.params.thread_id
      var reply_id = req.params.reply_id
      var password=req.params.delete_password
      var dbo
      mongo.connect(url).then(function(db) {
        dbo = db.db(dbName)
        dbo.collection(collReply).findOne({board:board,thread_id:thread_id})
          .then(function(reply) {
          if (reply) {
            reply.reported=true
            dbo.collection(collReply).update({_id:reply._id},reply)
              .then(function(count) {             
            res.send('success')
            })
          } else {
            res.send('incorrect password')
          }
        }).catch(function (err) {
          //failure callback
          console.log(err)
          res.send('failure')
        });  
      }).catch(function (err) {console.log(err)})      
    }
    
    exports.deleter=function (req, res){
      log('deleter')
      // change reply to '[deleted]' on thread
      var board = req.params.board
      var thread_id=req.params.thread_id
      var reply_id = req.params.reply_id
      var password=req.params.delete_password
      var dbo
      mongo.connect(url).then(function(db) {
        dbo = db.db(dbName)
        dbo.collection(collReply).findOne({board:board,thread_id:thread_id})
          .then(function(reply) {
          if (reply) {
            reply.text='[deleted]'
            dbo.collection(collReply).update({_id:reply._id},reply)
              .then(function(count) {             
            res.send('success')
            })
          } else {
            res.send('incorrect password')
          }
        })
      }).catch(function (err) {console.log(err)})      
    }
    
/*

var numStocks=0
var stock1=''
var stock2=''
var ip
var like
var stockDB1
var stockDB2

var showLog=function(msg) {
  //console.log(msg)
}
  
exports.get = function(req,res){
  showLog('using get')
  console.log(req.query)
  
  var qparams = req.query
  var qbody = req.body
  
  
  // get number/names of stocks
  if (Array.isArray(qparams.stock)) {
    numStocks=2
    stock1=qparams.stock[0]
    stock2=qparams.stock[1]
  } else {
    numStocks=1
    stock1=qparams.stock
  }
  showLog('numStocks: '+numStocks)
  like=qparams.like
  ip= req.ip

  // get stocks
  getStock(stock1,res,gotStock1)
  
}

function gotStock1(res,sdb1) {
  showLog('gotStock1')
  stockDB1=sdb1
  if (numStocks==2) {
    getStock(stock2,res,gotStock2)  
  } else {
    gotStock2(res,{})
  }
}
  


function gotStock2(res,sdb2) {
 // likes
  stockDB2=sdb2
  showLog('gotStock2')
  if (like=='true') {
    if (stockDB1.likeIPs.indexOf(ip)==-1) {
      showLog(like +' '+stockDB1.likeIPs.indexOf(ip)+' '+ip)
      stockDB1.likeIPs.push(ip)
      stockDB1.likes+=1
      
    }
    if (numStocks==2) {
      if (stockDB2.likeIPs.indexOf(ip)==-1) {
        stockDB2.likeIPs.push(ip)
        stockDB2.likes+=1
    }
    }
  }
  showLog('After likes:'+JSON.stringify(stockDB1))
  // prices
  price.getPrice(stockDB1.stock,function(result) {
    //console.log(result)
    stockDB1.price = result
    putStock(stockDB1,res)
    
    if (numStocks==2) {
      price.getPrice(stockDB2.stock,function(result) {
        //console.log(result)
        stockDB2.price = result
        putStock(stockDB2,res)
        doRest(res,numStocks,stockDB1,stockDB2)
      })
    } else {
      doRest(res,numStocks,stockDB1,stockDB2)
    }
  })
   
}

function doRest(res,numStocks,stockDB1,stockDB2) {
   // output
  var stockdata = {stockData:null}
  if (numStocks==1) {
     var stockBack1={stock:stockDB1.stock,price:stockDB1.price,likes:stockDB1.likes}
     stockdata.stockData=stockBack1
  } else {
     var stockBack1={stock:stockDB1.stock,price:stockDB1.price,rel_likes:stockDB1.likes-stockDB2.likes}
     var stockBack2={stock:stockDB2.stock,price:stockDB2.price,rel_likes:stockDB2.likes-stockDB1.likes}
    stockdata.stockData=[stockBack1,stockBack2]      
  }
  showLog(stockdata)
  res.send(stockdata)   
}

function getStock(stock,res,callback) {
  showLog('getStock:'+stock)
  var docObj=populateNewRec(stock)
  mongo.connect(url,function(err,db) {
  if (err) {res.send(JSON.stringify(err))
  } else {
    var dbo=db.db(dbName)
    var coll = dbo.collection(collName)
    coll.find({stock:stock}).toArray(function(err,docs){
      if (err) {
        res.send(JSON.stringify(err))
      }  else {
        //console.log(docs)
        if (docs.length==0) {
          showLog('inserting record')
          coll.insert(docObj,function(err,data){
            if (err) { res.send(JSON.stringify(err))
            } else {
              showLog('inserted')
              callback(res,docObj)
            }
          })
        } else {
        docObj=docs[0] 
        showLog('got this: '+JSON.stringify(docObj))
        db.close()
        callback(res,docObj)
        }
      }
    })
  }
  
  })
}      

function putStock(stock,res) {
  showLog('using putStock:'+JSON.stringify(stock))
  mongo.connect(url,function(err,db) {
  if (err) {res.send(JSON.stringify(err))
  } else {
    var dbo=db.db(dbName)
    var coll = dbo.collection(collName)
    coll.update({_id:ObjectId(stock._id)},stock,function(err,count) {
      if (err ) {
        showLog('Error:'+err)
        showLog('could not update '+stock._id)
      } else if (count.n==0) {
        showLog('id not found '+stock._id)
      } else {
        showLog('successfully updated')
      }      
    db.close()
    }
              )
  }
  
  })
}      


*/