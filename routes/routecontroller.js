require('promise')

// block'o'definitions
var url = process.env.DB
var dbName = 'fcc'
var collThread = 'msg'
var collReply = 'reply'
var mongo=require('mongodb').MongoClient
var {ObjectId} = require('mongodb')
//////////////////////


var log=function(msg){
  console.log(msg)
}


var populateNewThread=function(board) {
    var newRec ={}
    newRec.board = board
    newRec.text = ''
    newRec.created_on=(new Date).toLocaleString()
    newRec.bumped_on=newRec.created_on
    newRec.reported=false
    newRec.delete_password=''
    newRec.replies=[]
    newRec.replycount=0
    return newRec
}

var populateNewReply=function(board,thread_id) {
  var newRec = {}
  newRec.board = board
  newRec.thread_id = thread_id
  newRec.text = ''
  newRec.created_on=(new Date).toLocaleString()
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
      return dbo.collection(collThread).find( {board:board},
        {fields:{reported:false,delete_password:false}}).sort({bumped : 1}).limit(10).toArray()
      })
      .then(function(threads){
        
        function addReplies(thread) {
          //var myThread = thread
          return new Promise(function(resolve){
            dbo.collection(collReply)
             .find( {board:board,thread_id:ObjectId(thread._id)},
            {fields:{reported:false,delete_password:false}} ).sort({create_on:1}).toArray()
            .then(function(allReplies){
              thread.replycount = allReplies.length 
              thread.replies=allReplies.slice(0,3)
              resolve()
            })
              
          })
        }

        function processThreads(threads) {
          return threads.reduce(function(promise,thread){
            return promise.then(function(){
              return addReplies(thread)
            }).catch(function(err){console.log(err)})
          },Promise.resolve())
        }

        processThreads(threads)
        .then(function(){ 
          log('sending threads')
          res.setHeader('Content-Type', 'application/json');
          res.send(threads)
        })
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
          var path = getBoardPath(board)
          res.redirect(path)
        })
      }).catch(function(err){console.log(err)})
    }
    
    function getBoardPath(board){
      return '/b/'+board+'/'
    }
    
    exports.putt=function (req, res){
      // report thread
      log('putt')
      
      var thread_id = req.body.report_id
      var dbo
      mongo.connect(url).then(function(db) {
        dbo=db.db(dbName)
        return db.collection(collThread).findOne({_id:ObjectId(thread_id)})})
      .then(function(thread){
        if (thread) {
          thread.reported=true        
          dbo.collection(collThread).update({_id:thread._id},thread)
            .then(function() {             
            res.send('success')
          })
        }
      })  
      .catch(function (err) {console.log(err)})      
    }
    
    exports.deletet=function (req, res){
      log('deletet')
      // delete thread with password
      
      var thread_id = req.body.thread_id
      var password=req.body.delete_password
      var dbo
      mongo.connect(url).then(function(db) {
        dbo = db.db(dbName)
        dbo.collection(collThread).findOne({_id:ObjectId(thread_id)})
          .then(function(thread) {
          if (thread) {
            if (thread.delete_password==password) {
              thread.text='[deleted]'
              dbo.collection(collThread).update({_id:thread._id},thread)
              .then(function() {             
                res.send('success')})
              }
            else {
              res.send('incorrect password')
            }
          } else {
            res.send('incorrect password')
          }
        })
      }).catch(function (err) {console.log(err)})      
   }
    
    exports.getr=function (req, res){
      log('getr')
      // show all replies on thread
      var board = req.params.board
      var thread_id = req.query.thread_id
      var dbo
      var myThread
      mongo.connect(url).then(
        function(db){
          log('db')
          dbo=db.db(dbName)
          return dbo.collection(collThread).findOne( {board:board,_id:ObjectId(thread_id)},
            {fields:{reported:false,delete_password:false}})
          .then(function(thread){
          myThread=thread
          return dbo.collection(collReply)
          .find( {board:board,thread_id:thread._id},
          {fields:{reported:false,delete_password:false}} )
          .sort({created_on : 1}).toArray()})
          .then(function(replyArray){
            myThread.replies=replyArray
          })
          .then(function() {
            log('sending threads')
            res.setHeader('Content-Type', 'application/json')
            res.send(myThread)
          })
        })
      .catch(function(err) {
        log(err)
      })
     }
    
    function getThreadPath(board,thread_id){
          return '/b/'+board+'/'+thread_id+'/'
        }

    exports.postr=function (req, res){
      log('postr')
      // create reply on thread
      var board = req.params.board
      var thread_id = req.body.thread_id
      var dbo
      var myThread
      mongo.connect(url)
      .then(function(db) {
        dbo=db.db(dbName)
        return dbo.collection(collThread).findOne( {_id:ObjectId(thread_id)} )
      })
      .then(function(thread) {
        myThread=thread
        var newReply = populateNewReply(thread.board,thread._id)
        newReply.text = req.body.text
        newReply.delete_password = req.body.delete_password
        return dbo.collection(collReply).insert(newReply)
      }).then(function(reply){
        myThread.bumped_on=reply.created_on
        return dbo.collection(collThread).update({_id:myThread._id},myThread)
      })
      .then(function() {             
          res.redirect(getThreadPath(board,thread_id))
      }).catch(function (err) {
        console.log(err)
        res.send('Error creating reply: '+err)
      })      
    }
    
    exports.putr=function (req, res){
      log('putr')
      // report reply on thread
      var reply_id = req.body.reply_id
      var dbo
      mongo.connect(url).then(function(db) {
        dbo = db.db(dbName)
        dbo.collection(collReply).findOne({_id:ObjectId(reply_id)})
          .then(function(reply) {
          if (reply) {
            reply.reported=true
            dbo.collection(collReply).update({_id:reply._id},reply)
              .then(function() {             
            res.send('success')
            })
          } else {
            res.send('reply does not exist')
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
      var reply_id = req.body.reply_id
      var password=req.body.delete_password
      var dbo
      mongo.connect(url).then(function(db) {
        dbo = db.db(dbName)
        dbo.collection(collReply).findOne({_id:ObjectId(reply_id)})
          .then(function(reply) {
          if (reply) {
            if (reply.delete_password==password) {
              reply.text='[deleted]'
              dbo.collection(collReply).update({_id:reply._id},reply)
              .then(function(count) {             
                res.send('success')})
              }
            else {
              res.send('incorrect password')
            }
          } else {
            res.send('incorrect password')
          }
        })
      }).catch(function (err) {console.log(err)})      
    }
    
