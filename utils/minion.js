var request = require('request');
var config = require('../config.js');
var memory = require('../memory.js');
var genUtils = require('../utils/general.js');

var utilMethods = {
    getMinionsInLeader: function (minionLeaderId, res) {
        var minionLeaderUrl = "http://" + minionLeaderId;

        var options = {
            url: minionLeaderUrl + "/api/minions/list/",
            method: 'GET',
        };

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.end(body);
            }
            else {
                res.json({ status: "error", message: "Error with the leader while retrieving minions list." });
            }
        });
    },
    getLeaderDetails: function (minionLeaderId, res) {
        var minionLeaderUrl = "http://" + minionLeaderId;

        var options = {
            url: minionLeaderUrl + "/api/minions/all/",
            method: 'GET',
        };

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.end(body);
            }
            else {
                res.json({ status: "error", message: "Error while contacting leader." });
            }
        });

    },
    deleteMinion: function (minionId, res) {
        var minionLeaderId = minionId.split(":")[0];
        var minionLeaderUrl = "http://" + minionLeaderId + ":" + config[process.env.environment].leaderMinionPort;

        var options = {
            url: minionLeaderUrl + "/minions/delete/",
            method: 'POST',
            json: {
                "minionid": minionLeaderId,
                "authtoken": ""
            }
        };

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.end(body);
            }
            else {
                res.json({ status: "success", message: retMsg });
            }
        });

    },
    getMinionDetails: function (minionId, res) {
        var minionLeaderId = minionId.split(":")[0];
        var minionLeaderUrl = "http://" + minionLeaderId + ":" + config[process.env.environment].leaderMinionPort;

        var options = {
            url: minionLeaderUrl + "/api/minions/miniondetails/",
            method: 'POST',
            json: {
                "minionid": minionId,
            }
        };

        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                res.json(body);
            }
            else {
                res.json({ status: "error", message: "Failed connection to leader." });
            }
        });

    },
    getAllSessions: function (res) {
        var allHostDetails = memory.getAllHostDetails();
        var finalResponse = { status: "", message: {} };
        var hasErrors = false;
        var totalReceived = 0;

        allHostDetails.forEach(function (hostJson) {
            var minionLeaderId = hostJson.leaderId;
            var minionLeaderUrl = "http://" + minionLeaderId;

            var options = {
                url: minionLeaderUrl + "/api/minions/all/",
                method: 'GET',
            };

            request(options, function (error, response, body) {
                totalReceived += 1;
                if (!error && response.statusCode == 200) {
                    var retJson = JSON.parse(body);
                    finalResponse.message[minionLeaderId] = retJson.miniondetails;
                }
                else {
                    finalResponse.message[minionLeaderId] = "error";
                    hasErrors = true;
                }

                if (totalReceived >= allHostDetails.length) {
                    res.json(finalResponse);
                }
            });
        });
    },
    createWithForceSame: function (body, res) {
        var choosenHost = memory.getBestFitHost();
        var createdCount = 0;
        var numNeeded = body.count === undefined ? 1 : body.count;

        if (choosenHost == null) {
            resObject.json({ status: "error", message: "No host available for creating new minion." });
        }

        var finalResponse = {};
        var haveFailures = false;

        for (var i = 0; i < numNeeded; i++) {
            var minionLeaderId = choosenHost.leaderId;
            var minionLeaderUrl = "http://" + minionLeaderId.split(":")[0] + ":" + config[process.env.environment].leaderMinionPort;
            var options = {
                url: minionLeaderUrl + "minions/create/",
                method: 'POST',
                json: {
                    "sessionid": sessionId,
                    "authtoken": ""
                }
            };

            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    finalResponse["message"][createdCount] = body;
                } else {
                    var message = { status: "error", message: "Error while trying to contact host to create minion." };
                    finalResponse["message"][createdCount] = message;
                    haveFailures = true;
                }

                createdCount += 1;
                if (createdCount >= numNeeded) {
                    finalResponse["status"] = haveFailures ? "partial" : "success";
                    resObject.json(finalResponse);
                }
            });
        }
    },
    createWithNoForceSame: function (body, res) {
        var choosenHost = memory.getBestFitHost();
        var createdCount = 0;
        var numNeeded = body.count === undefined ? 1 : body.count;
        if (choosenHost == null) {
            resObject.json({ status: "error", message: "No host available for creating new minion." });
        }

        var finalResponse = {status:"", message:{}};
        var actualCreateCount = choosenHost.maxMinionsCount - choosenHost.trainingSessions.length;

        if (actualCreateCount <= 0) {
            resObject.json({ status: "error", message: "No host available for creating new minion with noforcesame strategy." });
        } else {
            actualCreateCount = numNeeded <= actualCreateCount ? numNeeded : actualCreateCount;

            var haveFailures = false;
            for (var i = 0; i < actualCreateCount; i++) {
                var proceedWithCreate = true;
                if ((choosenHost.trainingSessions.length >= choosenHost.maxMinionsCount) && (strategy != "force")) {
                    proceedWithCreate = false;
                }
                var minionLeaderId = choosenHost.leaderId;
                var minionLeaderUrl = "http://" + minionLeaderId;
                var options = {
                    url: minionLeaderUrl + "/api/minions/create/",
                    method: 'POST',
                    json: {
                        "sessionid": body.sessionid,
                        "authtoken": ""
                    }
                };

                request(options, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        finalResponse["message"][createdCount] = body;
                    } else {
                        var message = { status: "error", message: "Error while trying to contact host to create minion." };
                        finalResponse["message"][createdCount] = message;
                        haveFailures = true;
                    }

                    createdCount += 1;
                    if (createdCount >= actualCreateCount) {
                        finalResponse["status"] = haveFailures ? "partial" : "success";
                        res.json(finalResponse);
                    }
                });
            }
        }
    },
    createWithForceDiff: function () {

    },
    createWithNoForceDiff: function () {

    },
};

module.exports = utilMethods;