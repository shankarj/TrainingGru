var express = require('express');
var router = express.Router();
var database = require('../../database.js');
var request = require('request');
var memory = require('../../memory.js');

router.post('/run/:sessionid', function(req, res, next) {
  if (req.params.sessionid === undefined){
    var response = { status : "error", message : "One or more required params not provided for run."};
    res.json(response);
  }else{
    var minionId= memory.lookupSessions(req.params.sessionid);

    if (minionId === null){
      var response = { status : "error", message : "Given session id not running in any of the minions."};
      res.json(response);
    }else{
      var options = {        
				url :  "http://" + minionId + "/minion/run/" + req.params.sessionid,
				method : 'POST',
				json: req.body
      };

      request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            res.json(body);
        }
        else {
            res.json({ status : "error", message : "Endpoint failure."});
        }
      });        
    }
  }
});

module.exports = router;
