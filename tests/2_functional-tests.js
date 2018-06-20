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
          .post('/api/threads/:board')
         .send({
          issue_title: 'Title',
          issue_text: 'text', 
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
          })
          .end(function(err,res)  {
          assert.isNotNull(res.issue_title)
          assert.isNotNull(res.text)
          assert.isNotNull(res.delete_password)
          assert.isNotNull(res._id)
          assert.isNotNull(res.replies)
          assert.isNotNull(res.bumped_on)
          assert.isNotNull(res.created_on)
            done()
          })
      })})
    
    
    suite('GET', function() {
    test('Test TG1',function(done) {
      chai.request(server)
      .get('api/threads/:board')
      .end(function(err,res) {
        
        done()
      }
      
    )})})
    
    suite('DELETE', function() {
      test('Test TD1',function(done) {
      chai.request(server)
      .delete('api/threads/:board')
      .end(function(err,res) {
        done()
      }
    
    )})})
    
    suite('PUT', function() {
      test('Test TU1',function(done) {
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
       chai.request(server)
      .post('api/replies/:board')
      .end(function(err,res) {
        done()
      }
    )})})
    
    suite('GET', function() {
      test('Test RG1',function(done) {
       chai.request(server)
      .get('api/replies/:board')
      .end(function(err,res) {
        done()
      }
    )})})
    
    suite('PUT', function() {
      test('Test RU1',function(done) {
       chai.request(server)
      .get('api/replies/:board')
      .end(function(err,res) {
        done()
      }
    )})})
    
    suite('DELETE', function() {
      test('Test RD1',function(done) {
       chai.request(server)
      .delete('api/replies/:board')
      .end(function(err,res) {
        done()
      }
    )})})
  
  })
})


