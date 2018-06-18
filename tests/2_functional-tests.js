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
      test('Test 1',function(done) {
        
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
            done()
          })
      })
    });
    
    suite('GET', function() {
      done();
    });
    
    suite('DELETE', function() {
       done();     
    });
    
    suite('PUT', function() {
      done();
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      done()
    });
    
    suite('GET', function() {
      done()
    });
    
    suite('PUT', function() {
      done()
    });
    
    suite('DELETE', function() {
      done()
    });
    
  });

});
