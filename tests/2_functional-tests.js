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
  return new Promise(function (resolve) {
      chai.request(server)
      .post('/api/threads/'+boardName)
      .send({
      text: threadText, 
      delete_password: threadText
      })
      .end(function(err,res)  {
        doLog('createdThread')     
        resolve();
      })
    })
}

function createReply(boardName,threadID,replyText) {
  return new Promise(function (resolve) {
        doLog('createReply')
        chai.request(server)
        .post('/api/replies/'+boardName)
        .send({
        text: replyText,
        thread_id: threadID, 
        delete_password: threadText
        })
        .end(function(err,res)  {
          resolve()
        })
      }
  )
}

// assume text unique for test purposes
function getLatestThreadID(threadText) {
  doLog('getLatestThreadID')
  return new Promise(function (resolve,reject){
    mongo.connect(url).then(
    function(db){
      dbo=db.db(dbName)
      dbo.collection(collThread).find({text:threadText}).sort({created_on:1}).limit(1).toArray()
      .then(function(threads){
        if (threads.length>0) {
           resolve(threads[0]._id)
        } else {
           reject('No threads')
        }
       })
    }).catch(function(err){
      reject(err)
    })
  })
}

function getLatestReplyID(replyText) {
  doLog('getLatestReplyID')
  return new Promise(function(resolve,resolve){
    mongo.connect(url).then(
      function(db){
        dbo=db.db(dbName)
        dbo.collection(collReply).find({text:replyText}).sort({created_on:1}).limit(1).toArray()
        .then(function(replies){
          if (replies.length>0) {
           resolve(replies[0]._id)
        } else {
           reject('No replies')
        }
        
        })
      }).catch(function(err){
        reject(err)
      })
    })
  }
  
suite('Functional Tests', function() {
  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('Test TP1',function(done) {
        var boardName = (new Date).toLocaleString()
        var threadText = (new Date).toLocaleString()
        createThread(boardName,threadText)
        .then(
        getLatestThreadID(threadText).then(
          function(threadID) {
            chai.request(server)
            .get('/api/replies/'+boardName+'/?thread_id='+threadID)
            .end(function(err,res) {
              var thread = res.body
              assert.equal(thread.text,threadText,'Text must match '+threadText)
              done()
            })
          }).catch(function(){
            doLog('catch')
            done()
          })
        )
        })
      })
    })
    
    suite('GET', function() {
    test('Test TG1',function(done) {
        function createRecords() {
          return new Promise(function(resolve,reject) {
            // create 11 threads
            // create 4 replies on each
            var boardName = (new Date).toString()
            var threads = []
            for (var c=1;c<=11;c++) {
              threads.push('TG'+c)
            }
            var replies = []
            for (var c=1;c<=4;c++) {
              replies.push('R'+c)
            }

            function addReplies(thread) {
              return new Promise(function(resolve) {
                createThread(boardName,thread)
                .then(getLatestThreadID(thread)
                .then(function(threadID){
                  for (reply of replies){
                    createReply(boardName,threadID,reply)
                }            
                }))
              })
            }

            function processThreads(threads) {
              return threads.reduce(
                function(promise,thread){
                  return promise.then(
                    function(thread){
                      return addReplies(thread)
                    }
                  ).catch(function(err){console.log(err)})
                }
              ,Promise.resolve())
            }
          })
        }

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

        }
        ).catch(function(err){doLog(err)}
      
    )})}) 
    
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
  })})})
  
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



