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
/*
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices?stock=goog')
        .end(function(err, res){
        var stockData =res.body
           
        console.log(stockData)  
         assert.isDefined(stockData.stockData,'Object to have stockData element')
          done()
        })
      })
*/
  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      test('Test TP1',function(done) {
        
        chai.request(server)
          .post('/api/threads/test')
         .send({
          text: 'text', 
          delete_password: 'delete_password'
          })
          .end(function(err,res)  {
          // check return url is /b/test/
          // check thread exists with text timestamp
            done()
          })
      })})
    
    
    suite('GET', function() {
    test('Test TG1',function(done) {
      chai.request(server)
      .get('api/threads/:board')
      .end(function(err,res) {
        // check 10 most recently bumped threads returned 
        // check 3 most recent bumped threads returned
        // check appropriate fields hidden
        
        done()
      }
      
    )})})
    
    suite('DELETE', function() {
      test('Test TD1',function(done) {
      chai.request(server)
      .delete('api/threads/:board')
      .end(function(err,res) {
        // check text of thread is deleted
        done()
      }
    
    )})})
    
    suite('PUT', function() {
      test('Test TU1',function(done) {
       chai.request(server)
      .put('api/threads/:board')
      .end(function(err,res) {
        // check report of thread is true
        done()
      }
    )
  })})})
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      test('Test RP1',function(done) {
       chai.request(server)
      .post('api/replies/:board')
      .end(function(err,res) {
        // check thread bumped
        // check all reply fields saved
        done()
      }
    )})})
    
    suite('GET', function() {
      test('Test RG1',function(done) {
       chai.request(server)
      .get('api/replies/:board')
      .end(function(err,res) {
        // check all replies returned
        // check fields hidden
        done()
      }
    )})})
    
    suite('PUT', function() {
      test('Test RU1',function(done) {
       chai.request(server)
      .get('api/replies/:board')
      .end(function(err,res) {
        // check reply is reported
        done()
        
      }
    )})})
    
    suite('DELETE', function() {
      test('Test RD1',function(done) {
       chai.request(server)
      .delete('api/replies/:board')
      .end(function(err,res) {
        // check reply marked as deleted
        done()
      }
    )})})
  
  })
})


