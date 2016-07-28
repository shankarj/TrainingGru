var express = require('express');
var router = express.Router();
var database = require('../../database.js');
var request = require('request');
var memory = require('../../memory.js');
var trainingUtil = require('../../utils/training.js');
var genUtils = require('../../utils/general.js');

router.get('/start/:sessionid', function(req, res, next) {
	if (genUtils.isEmpty(req.params.sessionid)){
		var response = { status : "error", message : "One or more required params not provided for run."};
		res.json(response);
	}else{
		// If session is already present then delete it.
		var minionId = memory.getMinionUrlRunningSessionId(req.params.sessionid);
		var sessionPresent = false;
		
		if (minionId != null){
			sessionPresent = true;
			trainingUtil.deleteSession(req.params.sessionid, minionId, null, true);
		}
		
		if (!sessionPresent){
			
		}
	}
});
	
	
module.exports = router;