/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);


suite('Functional Tests', function() {

// block'o'definitions
var url = process.env.DB
var dbName = 'fcc'
var collThread = 'msg'
var collReply = 'reply'
var mongo=require('mongodb').MongoClient
var {ObjectId} = require('mongodb')
//////////////////////

function doLog(msg) {
  console.log(msg)
}

function createThread(boardName,threadText) {
  return new Promise(function (resolve,reject) {
      chai.request(server)
      .post('/api/threads/'+boardName)
      .send({
      text: threadText, 
      delete_password: threadText
      })
      .end(function(err,res)  {
        getLatestThreadID(threadText)
        .then(function(threadID){
          doLog('createdThread '+threadID+' '+threadText)   
          resolve(threadID)  
        })
      })
    })
}

function createReply(boardName,threadID,replyText) {
  return new Promise(function (resolve,reject) {
        chai.request(server)
        .post('/api/replies/'+boardName)
        .send({
        text: replyText,
        thread_id: threadID, 
        delete_password: replyText
        })
        .end(function(err,res)  {
          doLog('createdReply '+threadID+' '+replyText)
          getLatestReplyID(replyText)
          .then(function(replyID){
            resolve(replyID)
          })
        })
      }
  )
}

// assume text unique for test purposes
function getLatestThreadID(threadText) {
  doLog('getLatestThreadID '+threadText)
  return new Promise(function (resolve,reject){
    mongo.connect(url).then(
    function(db){
      dbo=db.db(dbName)
      dbo.collection(collThread).find({text:threadText}).sort({created_on:1}).limit(1).toArray()
      .then(function(threads){
        if (threads.length>0) {
          var threadID=threads[0]._id.toString()
           resolve(threadID)
        } else {
           reject('No threads')
        }
       })
    }).catch(function(err){
      doLog(err)
    })
  })
}

function getLatestReplyID(replyText) {
  doLog('getLatestReplyID '+replyText)
  return new Promise(function(resolve,reject){
    mongo.connect(url).then(
      function(db){
        dbo=db.db(dbName)
        dbo.collection(collReply).find({text:replyText}).sort({created_on:1}).limit(1).toArray()
        .then(function(replies){
          if (replies.length>0) {
          var replyID=replies[0]._id.toString()
           resolve(replyID)
        } else {
           reject('No replies')
        }
        })
      }).catch(function(err){
        doLog(err)
      })
    })
  }
  
  function createRecords() {
    var boardName      
    var replies=[]
    var threads = []

    function processReplies(threadID) {
      return replies.reduce(
        function (promise,replyText) {
          return promise.then(
            function(result) 
            {
              createReply(boardName,threadID,replyText)
            })
          },
          Promise.resolve())
        }
              
    

    function addReplies(thread) {
      return new Promise(function(resolve) {
        createThread(boardName,thread)
        .then(function(threadID){
          processReplies(threadID)
          .then(resolve())
        } 
        )
      })
    }

    function processThreads(threads) {
      return threads.reduce(
        function(promise,threadText){
          return promise.then(
            function(result){
              return addReplies(threadText)
            }
          ).catch(
            function(err){
              console.log(err)
            })
        }
      ,Promise.resolve())
    }

    return new Promise(function(resolve,reject) {
      // create 11 threads
      // create 4 replies on each
      boardName = (new Date).getTime().toString()
      for (var c=1;c<=11;c++) {
        threads.push('TG'+c)
      }
      
      for (var c=1;c<=4;c++) {
        replies.push('R'+c)
      }

      processThreads(threads).then(
        function() { 
          resolve()
          })
      })
    }


  suite('API ROUTING FOR /api/threads/:board', function() {
    /*
    suite('POST', function() {
      test('Test TP1',function(done) {
        var boardName = (new Date).getTime().toString()
        var threadText = (new Date).toLocaleString()
        var prom=createThread(boardName,threadText)

        prom.then(
          function(threadID) {
            var reqText = '/api/replies/'+boardName+'/?thread_id='+threadID
            doLog('get:'+reqText) 
            chai.request(server)
            .get(reqText)
            .end(function(err,res) {
              var thread = res.body
              assert.equal(thread.text,threadText,'Text must match '+threadText)
              done()
            })
          }).catch(function(err){
            assert.fail(0,1,err)
            doLog('catch: '+err)
            done()
          })
        })
      })
  
    */
    suite('GET', function() {
    test('Test TG1',function(done) {
        createRecords().then(function() {

          console.log('here')
          // check 10 most recently bumped threads returned 

          // check 3 most recent bumped threads returned
          // check appropriate fields hidden          
          // check 11th thread not in res

          // check 4th reply not in 1st thread
          chai.request(server)
          .get('api/threads/:board')
          .end(function(err,res) {
            assert.equal(1,0,'Create test')
           done()

        })
      }).catch(function(err){doLog(err)}
      
    )})}) 
    /*
    suite('DELETE', function() {
      test('Test TD1',function(done) {
        // create a thread on a new board
        // load the board
        // delete the first thread
        // load the board
        // check the text says [deleted]
        chai.request(server)
      .delete('api/threads/:board')
      .end(function(err,res) {
        assert.equal(1,0,'Create test')
        done()
      }
    
    )})})
    
    suite('PUT', function() {
      test('Test TU1',function(done) {
        // create new board and thread
        // load board
        // report first thread
        // check report of thread is true
        chai.request(server)
      .put('api/threads/:board')
      .end(function(err,res) {
        assert.equal(1,0,'Create test')
        
        done()
      }
    )
  })})
*/
})


/*
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('Test RP1',function(done) {
        // create new board and thread
        // create reply on thread
        // check thread bumped        
        chai.request(server)
      .post('api/replies/:board')
      .end(function(err,res) {
        assert.equal(1,0,'Create test')
        done()
      }
    )})})
    
    suite('GET', function() {
      test('Test RG1',function(done) {
        // create new board and thread
        // create new replies
        // get thread and replies
        // check all replies returned
        // check fields hidden
        chai.request(server)
      .get('api/replies/:board')
      .end(function(err,res) {
        assert.equal(1,0,'Create test')
        
        done()
      }
    )})})
    
    suite('PUT', function() {
      test('Test RU1',function(done) {
        // create new board and thread
        // create new reply
        // report reply
        // check reply for reported
       chai.request(server)
      .get('api/replies/:board')
      .end(function(err,res) {
        
        assert.equal(1,0,'Create test')
      
        done()
        
      }
    )})})
    
    suite('DELETE', function() {
        // check reply marked as deleted
        // create new board and thread
        // create new reply
        // delete reply
        // check deleted
        test('Test RD1',function(done) {
       chai.request(server)
      .delete('api/replies/:board')
      .end(function(err,res) {
        assert.equal(1,0,'Create test')
        done()
      }
    )})})
    
  })
  */
})




