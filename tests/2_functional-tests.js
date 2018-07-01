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

var numThreads=11 // 11
var numReplies=4 // 4


function doLog(msg) {
  //console.log(msg)
}

function createThread(boardName,threadText) {
  return new Promise(function (resolve,reject) {
      doLog('creatingThread '+threadText)
      chai.request(server)
      .post('/api/threads/'+boardName)
      .send({
        text: threadText, 
        delete_password: threadText
      })
      .end(function(err,res)  {
        if (err) {
          reject(err)
        }

        getLatestThreadID(threadText)
        .then(function(threadID){
          doLog('createdThread '+threadID+' '+threadText)   
          resolve(threadID) 
        }
      )
      })
    })
}

// assume text unique for test purposes
function getLatestThreadID(threadText) {
  doLog('getLatestThreadID '+threadText)
  return new Promise(function (resolve,reject){
    mongo.connect(url).then(
    function(db){
      dbo=db.db(dbName)
      dbo.collection(collThread).find({text:threadText}).sort({created_on:-1}).limit(1).toArray()
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

function createReply(boardName,threadID,replyText) {
  return new Promise(function (resolve,reject) {
        doLog('creatingReply '+threadID+' '+replyText)
        chai.request(server)
        .post('/api/replies/'+boardName)
        .send({
        text: replyText,
        thread_id: threadID, 
        delete_password: replyText
        })
        .end(function(err,res)  {
          if (err) {reject(err)}
          getLatestReplyID(replyText).then(function(replyID){
            resolve(replyID)
          })
        })
      }
  )
}


function getLatestReplyID(replyText) {
  doLog('getLatestReplyID '+replyText)
  return new Promise(function(resolve,reject){
    mongo.connect(url).then(
      function(db){
        dbo=db.db(dbName)
        dbo.collection(collReply).find({text:replyText}).sort({created_on:-1}).limit(1).toArray()
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
      doLog('processReplies: '+threadID)
      return replies.reduce(
        function (promise,replyText) {
          return promise.then(function(){
            return createReply(boardName,threadID,replyText)
            .then(function(result){
              doLog('createdReply: '+result)
              
            })
          })
          }  
          ,
          Promise.resolve()
        )
      }
              
    function addReplies(thread) {
      return new Promise(function(resolve) {
        return createThread(boardName,thread)
        .then(function(threadID){
          return processReplies(threadID)
          .then(function(result){
            doLog('processedReplies')
            resolve()
          })
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

    boardName = (new Date).getTime().toString()
    for (var c=1;c<=numThreads;c++) {
      threads.push('TG'+c)
    }
    
    for (var c=1;c<=numReplies;c++) {
      replies.push('R'+c)
    }

    var prom = new Promise(function(resolve,reject){
      
       processThreads(threads).then(
         function(){
           resolve(boardName)
          }) 
      })

    return prom
    }

    function getThread(boardName,threadID) {
        return new Promise(function(resolve,reject){
        var reqText = '/api/replies/'+boardName+'/?thread_id='+threadID
        doLog('getThread:'+reqText) 
        chai.request(server)
        .get(reqText)
        .end(function(err,res) {
          if (err) {
            doLog(err)}
            else{
              var threads = res.body
              resolve(threads)
            }
          })
        })
    }



  suite('API ROUTING FOR /api/threads/:board', function() {
    
    
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
  
    
    // This is not getting the requisite done() ?

    suite('GET', function() {
    test('Test TG1',function(done) {
      function doGetTest(boardName) {
        return new Promise(function(resolve,reject) {
          chai.request(server)
          .get('/api/threads/'+boardName)
          .end(function(err,res) {
            if(err) {
              doLog(err)
              assert.fail(0,1,'Error in processing')
            } else {  
              // check appropriate fields hidden   
              var threads = res.body

              assert.isUndefined(threads[0].reported ,'reported should not be defined')
              assert.isUndefined(threads[0].delete_password,'delete_password should not be defined')
              // check 1st thread not in res TG1
              var found1st=false
              for (var c=0; c<threads.length;c++) {
                if (threads[c].text=='TG1') {
                  found1st=true
                }
              }
            assert.isFalse(found1st,'1st thread should not be returned')
    
            // check 1st reply not in 1st thread R1
            found1st=false
            for (var c=0;c<threads[0].replies.length;c++) {
              if (threads[0].replies[c].text=='R1') {
                found1st=true
              }
            }
            assert.isFalse(found1st,'1st reply should not be in replies')
            resolve()}
          })
        })
      }
  
      createRecords()
        .then(function(boardName) {
            doGetTest(boardName).then(function() { 
              done()
          })
        }).catch(function(err){
          doLog(err)
          done()})
        })
    }) 
    
    
   
    suite('DELETE', function() {
      test('Test TD1',function(done) {
        // create a thread on a new board
        var boardName = (new Date).getTime().toString()
        var threadText = (new Date).toLocaleString()
        var prom=createThread(boardName,threadText)
        prom.then(
          function(threadID) {
            // delete the thread
            var reqText = '/api/threads/'+boardName
            doLog('delete:'+reqText) 
            chai.request(server)
            .delete(reqText)
            .send({
              thread_id: threadID, 
              delete_password:threadText
              })
            .end(function(err,res) {
              if (err) {
                doLog(err)
              }
               // load the thread
               var reqText = '/api/replies/'+boardName+'/?thread_id='+threadID
               doLog('get:'+reqText) 
               chai.request(server)
               .get(reqText)
               .end(function(err,res) {
                  var thread = res.body
                  // check the text says [deleted]
                  assert.equal(thread.text,'[deleted]','Text must match [deleted]')
                  done()
              })
            })
          })
        })
      })        
    
    
    
    suite('PUT', function() {
      test('Test TU1',function(done) {
        // create a thread on a new board
        var boardName = (new Date).getTime().toString()
        var threadText = (new Date).toLocaleString()
        var prom=createThread(boardName,threadText)
        prom.then(
          function(threadID) {
            // report the thread
            var reqText = '/api/threads/'+boardName //+'/?thread_id='+threadID
            doLog('report:'+reqText) 
            chai.request(server)
            .put(reqText)
            .send({thread_id:threadID})
            .end(function(err,res) {
              if (err) {doLog(err)}
              assert.equal(res.text,'success','Success to be returned as text')
              done()
            })
        })
      })
    }) 
  
  })

  
  suite('API ROUTING FOR /api/replies/:board', function() {
    

    suite('POST', function() {
      test('Test RP1',function(done) {
        var boardName = (new Date).getTime().toString()
        var threadText = (new Date).toLocaleString()
        var replyText = 'test'
        var prom=createThread(boardName,threadText)

        prom.then(
          function(threadID) {
            var promReply = createReply(boardName,threadID,replyText)
            promReply.then(
              function(replyID) {   
                var reqText = '/api/replies/'+boardName+'/?thread_id='+threadID
                doLog('get:'+reqText) 
                chai.request(server)
                .get(reqText)
                .end(function(err,res) {
                  if (err) {doLog(err)}
                  
                  var thread = res.body
                  var reply = thread.replies[0]
                  assert.equal(thread.bumped_on ,reply.created_on,'Thread bumped_on should equal Reply.created_on')
                  done()
                })
              }).catch(function(err){
                assert.fail(0,1,err)
                doLog('catch: '+err)
                done()
              })
      }
    )})})
    
    suite('GET', function() {
      test('Test RG1',function(done) {
        // create new board and thread
        // create new replies
        // get thread and replies
        // check all replies returned
        // check fields hidden
        var boardName = (new Date).getTime().toString()
        var threadText = (new Date).toLocaleString()
        var replyText = 'test'
        var prom=createThread(boardName,threadText)

        prom.then(
          function(threadID) {
            var promReply = createReply(boardName,threadID,replyText)
            promReply.then(
              function(replyID) {
                var reqText = '/api/replies/'+boardName+'/?thread_id='+threadID
                doLog('get:'+reqText) 
                chai.request(server)
                .get(reqText)
                .end(function(err,res) {
                  var thread = res.body
                  var reply = thread.replies[0]
                  assert.isUndefined(reply.reported,'reply.reported should not be in results')
                  assert.isUndefined(reply.delete_password,'reply.delete_password should not be in results')
                  done()
                })
              }).catch(function(err){
                assert.fail(0,1,err)
                doLog('catch: '+err)
                done()
              })
      }
      
    )})})
    
    suite('PUT', function() {
      test('Test RU1',function(done) {
        // create new board and thread
        // create new reply
        // report reply
        // check reply for reported
        var boardName = (new Date).getTime().toString()
        var threadText = (new Date).toLocaleString()
        var replyText = 'test'
        var prom=createThread(boardName,threadText)

        prom.then(
          function(threadID) {
            var promReply = createReply(boardName,threadID,replyText)
            promReply.then(
              function(replyID) {    
                var reqText = '/api/replies/'+boardName+'/?thread_id='+threadID
                doLog('put:'+reqText) 
                chai.request(server)
                .put(reqText)
                .send({
                  reply_id: replyID,
                  thread_id: threadID 
                  })
                .end(function(err,res) {
                  assert.equal(res.text ,'success','success returned')
                  done()
                  /*
                  Cannot get reported field

                  var reqText = '/api/replies/'+boardName+'/?thread_id='+threadID
                  doLog('getThread:'+reqText) 
                  chai.request(server)
                  .get(reqText)
                  .end(function(err,res) {
                  if (err) {doLog(err)}
                  else {
                      myThread=res.body
                      if (myThread.replies.length>0) {
                        var reply = myThread.replies[0]
                        assert.equal(reply.reported ,true,'Reply reported should be true')
                        } else {
                        assert.fail(1,0,'Reply cannot be found.')
                        }
                      done()                              
                    }
                  })*/
                })
              }).catch(function(err){
                assert.fail(0,1,err)
                doLog('catch: '+err)
                done()
              })
      })
          }
      )})
    
    
    suite('DELETE', function() {
        // check reply marked as deleted
        // create new board and thread
        // create new reply
        // delete reply
        // check deleted
        test('Test RD1',function(done) {
          var boardName = (new Date).getTime().toString()
          var threadText = (new Date).toLocaleString()
          var replyText = 'test'
          var prom=createThread(boardName,threadText)
  
          prom.then(
            function(threadID) {
              var promReply = createReply(boardName,threadID,replyText)
              promReply.then(
                function(replyID) {    
                  var reqText = '/api/replies/'+boardName+'/?thread_id='+threadID
                  doLog('delete:'+reqText) 
                  chai.request(server)
                  .delete(reqText)
                  .send({
                    reply_id: replyID,
                    thread_id: threadID, 
                    delete_password: replyText
                    })
                  .end(function(err,res) {
                    var reqText = '/api/replies/'+boardName+'/?thread_id='+threadID
                    doLog('getThread:'+reqText) 
                    chai.request(server)
                    .get(reqText)
                    .end(function(err,res) {
                    if (err) {doLog(err)}
                    else {
                        myThread=res.body
                        if (myThread.replies.length>0) {
                          var reply = myThread.replies[0]
                          assert.equal(reply.text ,'[deleted]','Reply text should be [deleted]')
                          } else {
                          assert.fail(1,0,'Reply cannot be found.')
                          }
                        done()                              
                      }
                    })
                })
                },
              function(err){
                doLog(err)}
              ).catch(function(err){
                  assert.fail(0,1,err)
                  doLog('catch: '+err)
                  done()
                })
        })
      }
    )})
   
  
  })
  
  
})




