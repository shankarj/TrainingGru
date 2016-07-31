var express = require('express');
var router = express.Router();
var database = require('../../database.js');
var request = require('request');
var memory = require('../../memory.js');
var minionUtil = require('../../utils/minion.js');
var genUtils = require('../../utils/general.js');
var config = require('../../config.js');

router.post('/leader/create/', function (req, res, next) {
	if (genUtils.isEmpty(req.body.sessionid)) {
		var response = { status: "error", message: "One or more required params not provided for create minion." };
		res.json(response);
	} else {
		var createStrategy = req.body.createstrategy === undefined ? req.body.createstrategy : config[process.env.environment].minionCreateStrategy;

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
	if ((genUtils.isEmpty(req.body.sessionid))) {
		var response = { status: "error", message: "One or more required params not provided to get leader of a session." };
		res.json(response);
	} else {
		var leaderId = memory.getLeaderWithSession(req.body.sessionid);
		var response = { status: "", message: "" };
		if (leaderId != null) {
			response.status = "error";
			response.message = "Session not found.";
		} else {
			response.status = "success";
			response.message = { "leaderid": leaderId };
		}
		res.json(response);
	}
});

router.post('/leader/minionofsession/', function (req, res, next) {
	if ((genUtils.isEmpty(req.body.sessionid))) {
		var response = { status: "error", message: "One or more required params not provided to get minion of a session." };
		res.json(response);
	} else {
		var minionLeaderId = memory.getLeaderWithSession(req.body.sessionid);
		var response = { status: "", message: "" };
		if (minionLeaderId != null) {
			response.status = "error";
			response.message = "Session not found.";
			res.json(response);
		} else {
			response.status = "success";
			var minionLeaderUrl = "http://" + minionLeaderId + ":" + config[process.env.environment].leaderMinionPort;
			var options = {
				url: minionLeaderUrl + "/minionofsession/",
				method: 'POST',
				json: {
					"sessionid": sessionId,
					"authtoken": ""
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
	if ((genUtils.isEmpty(req.body.sessionid)) || (genUtils.isEmpty(req.body.leaderid))) {
		var response = { status: "error", message: "One or more required params not provided to get list of minions in a leader." };
		res.json(response);
	} else {
		minionUtil.getMinionsInLeader(req.body.leaderid, res);
	}
});

router.post('/leaderdetails/', function (req, res, next) {
	if ((genUtils.isEmpty(req.body.sessionid)) || (genUtils.isEmpty(req.body.leaderid))) {
		var response = { status: "error", message: "One or more required params not provided to get details of minion leader." };
		res.json(response);
	} else {
		minionUtil.getLeaderDetails(req.body.leaderid, res);
	}
});

router.post('/allsessions/', function (req, res, next) {
	if (genUtils.isEmpty(req.body.sessionid)) {
		var response = { status: "error", message: "One or more required params not provided to get list of all sessions." };
		res.json(response);
	} else {
		minionUtil.getAllSessions(res);
	}
});

router.post('/miniondetails/', function (req, res, next) {
	if ((genUtils.isEmpty(req.body.sessionid)) || (genUtils.isEmpty(req.body.minionid))) {
		var response = { status: "error", message: "One or more required params not provided to get details of minion." };
		res.json(response);
	} else {
		minionUtil.getMinionDetails(req.body.minionid, res);
	}
});

router.post('/delete/', function (req, res, next) {
	if ((genUtils.isEmpty(req.body.sessionid)) || (genUtils.isEmpty(req.body.minionid))) {
		var response = { status: "error", message: "One or more required params not provided for delete minion." };
		res.json(response);
	} else {
		minionUtil.deleteMinion(req.body.minionid, res);
	}
});