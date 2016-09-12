var express = require('express');
var router = express.Router();
var request = require('request');
var memory = require('../../memory.js');
var genUtils = require('../../utils/general.js');

router.post('/run/:sessionid', function(req, res, next) {
  if (req.params.sessionid === undefined){
    var response = { status : "error", message : "One or more required params not provided for run."};
    res.json(response);
  }else{
    var callbackParams = {
      sessionid: req.params.sessionid,
      reqbody: req.body,
      resobj: res 
    }
    memory.lookupSessions(req.params.sessionid, callbackForDbLookup, callbackParams);
  }
});

function callbackForDbLookup(callbackParams){
  var res = callbackParams.resobj;
  if (genUtils.isEmpty(callbackParams.minionid)){
      var response = { status : "error", message : "Given session id not running in any of the minions."};
      res.json(response);
    }else{
      // Update lookup map local
      var sessionId = callbackParams.sessionid;
      var minionId = callbackParams.minionid;
      var reqBody = callbackParams.reqbody;

      var options = {        
				url :  "http://" + minionId + "/minion/run/" + sessionId,
				method : 'POST',
				json: reqBody
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

module.exports = router;
