var express = require('express');
var router = express.Router();
var database = require('../../database.js');
var request = require('request');
var memory = require('../../memory.js');
var minionUtil = require('../../utils/minion.js');
var genUtils = require('../../utils/general.js');
var config = require('../../config.js');

router.post('/create/', function (req, res, next) {
	if ((genUtils.isEmpty(req.body)) || (genUtils.isEmpty(req.body.sessionid))) {
		var response = { status: "error", message: "One or more required params not provided for create minion." };
		res.json(response);
	} else {
		var createStrategy = req.body.createstrategy === undefined ? config[process.env.environment].minionCreateStrategy : req.body.createstrategy;

		switch (createStrategy) {
			case 'forcesame':
				minionUtil.createWithForceSame(req.body, res);
				break;
			case 'noforcesame':
				minionUtil.createWithNoForceSame(req.body, res);
				break;
			case 'forcediff':
				minionUtil.createWithForceDiff(req.body, res);
				break;
			case 'noforcediff':
				minionUtil.createWithNoForceDiff(req.body, res);
				break;
			default:
				res.json({ status: "error", message: "Create strategy not recognized." });
		}

	}
});

router.post('/leaderofsession/', function (req, res, next) {
	if ((genUtils.isEmpty(req.body)) || (genUtils.isEmpty(req.body.sessionid))) {
		var response = { status: "error", message: "One or more required params not provided to get leader of a session." };
		res.json(response);
	} else {
		var response = { status: "", message: "" };

		try {
			var leaderId = memory.getLeaderWithSession(req.body.sessionid);
			if (leaderId != null) {
				response.status = "success";
				response.message = { "leaderid": leaderId };
			} else {
				response.status = "error";
				response.message = "Session not found.";
			}
		} catch (error) {
			var response = { status: "error", message: error };
		}

		res.json(response);
	}
});

router.post('/minionofsession/', function (req, res, next) {
	if ((genUtils.isEmpty(req.body)) || (genUtils.isEmpty(req.body.sessionid))) {
		var response = { status: "error", message: "One or more required params not provided to get minion of a session." };
		res.json(response);
	} else {
		console.log("minionofsession: " + req.body.sessionid);
		var minionLeaderId = memory.getLeaderWithSession(req.body.sessionid);

		console.log("leaderid of session: " + minionLeaderId);
		var response = { status: "", message: "" };
		if (minionLeaderId === null) {
			response.status = "error";
			response.message = "No leader found for the given session.";
			res.json(response);
		} else {
			var minionLeaderUrl = "http://" + minionLeaderId;
			console.log("constructed minion url: " + minionLeaderUrl);

			var options = {
				url: minionLeaderUrl + "/api/minions/minionofsession/",
				method: 'POST',
				json: {
					"sessionid": req.body.sessionid
				}
			};

			request(options, function (error, response, body) {
				var successDelete = false;
				if (!error && response.statusCode == 200) {
					res.json(body);
				}
			});
		}
	}
});

router.post('/minionsinleader/', function (req, res, next) {
	if ((genUtils.isEmpty(req.body)) || (genUtils.isEmpty(req.body.leaderid))) {
		var response = { status: "error", message: "One or more required params not provided to get list of minions in a leader." };
		res.json(response);
	} else {
		minionUtil.getMinionsInLeader(req.body.leaderid, res);
	}
});

router.post('/leaderdetails/', function (req, res, next) {
	if ((genUtils.isEmpty(req.body)) || (genUtils.isEmpty(req.body.leaderid))) {
		var response = { status: "error", message: "One or more required params not provided to get details of minion leader." };
		res.json(response);
	} else {
		minionUtil.getLeaderDetails(req.body.leaderid, res);
	}
});

router.get('/all/', function (req, res, next) {
	minionUtil.getAllSessions(res);
});

router.post('/miniondetails/', function (req, res, next) {
	if ((genUtils.isEmpty(req.body)) || (genUtils.isEmpty(req.body.minionid))) {
		var response = { status: "error", message: "One or more required params not provided to get details of minion." };
		res.json(response);
	} else {
		minionUtil.getMinionDetails(req.body.minionid, res);
	}
});

router.post('/delete/', function (req, res, next) {
	if ((genUtils.isEmpty(req.body)) || (genUtils.isEmpty(req.body.sessionid)) || (genUtils.isEmpty(req.body.minionid))) {
		var response = { status: "error", message: "One or more required params not provided for delete minion." };
		res.json(response);
	} else {
		minionUtil.deleteMinion(req.body.minionid, res);
	}
});


module.exports = router;