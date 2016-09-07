var express = require('express');
var router = express.Router();
var request = require('request');
var memory = require('../../memory.js');
var trainingUtil = require('../../utils/training.js');
var genUtils = require('../../utils/general.js');
var config = require('../../config.js');

router.post('/notifydone/', function(req, res, next) {
	if ((genUtils.isEmpty(req.body)) || (genUtils.isEmpty(req.body.sessionid)) || (genUtils.isEmpty(req.body.leaderid) || (genUtils.isEmpty(req.body.minionid)))){
		var response = { status : "error", message : "One or more required params not provided for notifydone."};
		res.json(response);
	}else{
		memory.addToRunningSessions(req.body.sessionid, req.body.leaderid);
		memory.addToLookupSessions(req.body.sessionid, req.body.minionid);
		memory.removeFromTrainingSessions(req.body.sessionid, req.body.leaderid);

		// Create a new snapshot from the new structure and conns. 
		var options = {
			url :  config[process.env.environment].coreApiEndpoint + "/api/snapshots/create",
			method : 'POST',
			json: req.body
		};

		request(options, function (error, response, body) {
			var successDelete = false;
			if (!error && response.statusCode == 200) {
				res.json(body);				
			}else{
				res.json({ status : "error", message : "Error while contacting core to create new snapshot."});
			}				
		});
	}
});

router.post('/start/', function(req, res, next) {
	if (genUtils.isEmpty(req.body.sessionid)){
		var response = { status : "error", message : "One or more required params not provided for run."};
		res.json(response);
	}else{
		var minionLeaderId = memory.getLeaderWithTrainingSession(req.body.sessionid);

		if (minionLeaderId != null){
			// Error. The service is being trained somewhere already.
			res.json({ status : "error", message : "This service is being trained already. Delete it before issuing a new training request."});
		}else{
			// If session is already running in a minion then delete it and create a new training session.
			minionLeaderId = memory.getLeaderWithRunningSession(req.body.sessionid);
			if (minionLeaderId != null){
				// Need a check here to see if the user has paid for a dedicated machine.
				trainingUtil.deleteAndCreateSession(req.body.sessionid, minionLeaderId, res, req.body.scheduleStrategy);
			}else{
				trainingUtil.createSession(req.body.sessionid, res)
			}
		}
	}
});

router.post('/pause/', function(req, res, next) {
	if (genUtils.isEmpty(req.body.sessionid)){
		var response = { status : "error", message : "One or more required params not provided for pause."};
		res.json(response);
	}else{		
		var leaderId = memory.getLeaderWithTrainingSession(req.body.sessionid);

		if (leaderId == null){
			res.json({ status : "error", message : "Given session id not found."});
		}else{
			var minionLeaderUrl = "http://" + leaderId.split(":")[0] + ":" + config[process.env.environment].leaderMinionPort; 
			var options = {
				url :  minionLeaderUrl + "/training/pause/",
				method : 'POST',
				json: {
					"sessionid": req.body.sessionid,
					"authtoken": ""
				}
      		};

			request(options, function (error, response, body) {
				var successDelete = false;
				if (!error && response.statusCode == 200) {
					res.end(body);				
				}else{
					res.json({ status : "error", message : "Error while contacting minion to pause the given session id."});
				}				
			});       
		}
	}
});


router.post('/stop/', function(req, res, next) {
	if (genUtils.isEmpty(req.body.sessionid)){
		var response = { status : "error", message : "One or more required params not provided for stop."};
		res.json(response);
	}else{		
		var leaderId = memory.getLeaderWithTrainingSession(req.body.sessionid);

		if (leaderId == null){
			res.json({ status : "error", message : "Given session id not found."});
		}else{
			var minionLeaderUrl = "http://" + leaderId.split(":")[0] + ":" + config[process.env.environment].leaderMinionPort; 
			var options = {
				url :  minionLeaderUrl + "/training/stop/",
				method : 'POST',
				json: {
					"sessionid": req.body.sessionid,
					"authtoken": ""
				}
      		};

			request(options, function (error, response, body) {
				var successDelete = false;
				if (!error && response.statusCode == 200) {
					res.end(body);				
				}else{
					res.json({ status : "error", message : "Error while contacting minion to stop the given session id."});
				}				
			});       
		}
	}
});+

router.post('/delete/', function(req, res, next) {
	if (genUtils.isEmpty(req.body.sessionid)){
		var response = { status : "error", message : "One or more required params not provided for delete."};
		res.json(response);
	}else{		
		var minionLeaderId = memory.getLeaderWithTrainingSession(req.body.sessionid);

		if (minionLeaderId == null){
			res.json({ status : "error", message : "Given session id not found."});
		}else{
			trainingUtil.deleteTrainingSession(req.body.sessionid, minionLeaderId, res);
		}
	}
});
	
module.exports = router;