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

function createThread(boardName,threadText) {
chai.request(server)
.post('/api/threads/'+boardName)
.send({
text: threadText, 
delete_password: threadText
})
.end(function(err,res)  {
})
// return latest new threadid

}

function createReply(boardName,threadID,replyText) {
  chai.request(server)
  .post('/api/replies/'+boardName)
  .send({
  text: replyText,
  thread_id: threadID, 
  delete_password: threadText
  })
  .end(function(err,res)  {
  })
// return latest new replyid

}

function getLatestThreadID(resolve) {
  mongo.connect(url).then(
    function(db){
      log('db')
      dbo=db.db(dbName)
      return dbo.collection(collThread).findOne().sort({created_on:-1})
      .then(function(thread){
        resolve(thread._id)
      })
    }).catch(function(err){
      log(err)
    })
}

function getLatestReplyID(resolve) {
  mongo.connect(url).then(
    function(db){
      log('db')
      dbo=db.db(dbName)
      return dbo.collection(collReply).findOne().sort({created_on:-1})
      .then(function(reply){
        resolve(reply._id)
      })
    }).catch(function(err){
      log(err)
    })
  }
  


suite('Functional Tests', function() {
  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('Test TP1',function(done) {
        var boardName = Date.toString()
        var threadText = Date.toString()
        createThread(boardName,threadText)
        getLatestThreadID().then(
          function(threadID) {
            chai.request(server)
            .get('/api/replies/'+boardName+'/?thread_id='+threadID)
            .end(function(err,res) {
              var thread = res.body
              assert.equal(thread.text,threadText,'Text must match '+threadText)
              done()
            })
          })
        })
      })
    })
    
    suite('GET', function() {
    test('Test TG1',function(done) {
        // create 11 threads
        // create 4 replies on each
        var boardName = Date.toString()
        var threads = []
        for (var c=1;c<=11;c++) {
          threads.push('TG'+c)
        }
        var replies = []
        for (var c=1;c<=4;c++) {
          replies.push('R'+c)
        }
        for (thread of threads) {
          createThread(boardName,thread)
          var threadID
          getLatestThreadID(function(threadID){
            for (reply of replies){
              createReply(boardName,threadID,reply)
            }
            // rest of test here
            
          })

        }



        // check 10 most recently bumped threads returned 

        // check 3 most recent bumped threads returned
        // check appropriate fields hidden
        
        
        // check 11th thread not in res

        // check 4th reply not in 1st thread
        chai.request(server)
      .get('api/threads/:board')
      .end(function(err,res) {
        
        done()
      }
      
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
        done()
      }
    )})})
  
  })
})


