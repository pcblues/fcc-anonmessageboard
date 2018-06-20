/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var route = require('./routecontroller.js')

module.exports = function (app) {
  
  app.route('/api/threads/:board')
    .get(function (req, res){
    route.gett(req,res)      
    })
    
    .post(function (req, res){
      route.postt(req,res)
    })
    
    .put(function (req, res){
      route.putt(req,res)
    })
    
    .delete(function (req, res){
      route.deletet(req,res)
    });
    
    
  app.route('/api/replies/:board')
      .get(function (req, res){
    route.getr(req,res)      
    })
    
    .post(function (req, res){
      route.postr(req,res)
    })
    
    .put(function (req, res){
      route.putr(req,res)
    })
    
    .delete(function (req, res){
      route.deleter(req,res)
    });
    

  
  /*
  
  app.route('/api/stock-prices')
    .get(function (req, res){
        route.get(req,res)
    })
    */
};
