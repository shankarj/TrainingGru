var express = require('express');
var router = express.Router();
var database = require('../../database.js');
var request = require('request');
var memory = require('../../memory.js');

router.get('/:sessionid', function(req, res, next) {
  if (req.params.sessionid === undefined){
    response = { status : "error", message : "One or more required params not provided for run."}
    res.json(response);
  }else{
    var url = memory.getMinionUrlRunningSessionId(req.params.sessionid);

    if (url === null){
      response = { status : "error", message : "Given session id not running in any of the minions."};
      res.json(response);
    }else{
      var options = {
        uri : url,
        method : 'GET'
      }; 

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.end(body);
        }
        else {
            response = { status : "error", message : "Endpoint failure."};
            res.json(response);
        }
      });        
    }
  }
});



module.exports = router;
