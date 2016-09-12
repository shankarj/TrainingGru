var genUtils = require('./utils/general.js');
var config = require('./config.js');
var request = require('request');

// This variable is for quick lookup during sandbox calls for deployed services.
var runningSessionLookupMap = {};

// Details of all the hosts with minions running in them. 
var minionHostsDetails = [
    {
        leaderId: "localhost:8081",
        maxMinionsCount: 10,
        trainingSessions: [],
        runningSessions: []
    }
];

var memoryOperations = {
    getBestFitHost: function () {
        var allMinionHosts = minionHostsDetails;
        var choosenHost = null;

        if ((allMinionHosts.length == 1)) {
            choosenHost = allMinionHosts[0];
        } else {
            var minVal = allMinionHosts[0].trainingSessions.length;

            for (var i = 1; i < allMinionHosts.length; i++) {
                if (allMinionHosts[i].trainingSessions.length < minVal) {
                    minVal = allMinionHosts[i].trainingSessions.length;
                    choosenHost = allMinionHosts[i]
                }
            }
        }

        return choosenHost;
    },
    addToTrainingSessions: function (sessionId, leaderId) {
        if ((!genUtils.isEmpty(sessionId)) && (!genUtils.isEmpty(leaderId))) {
            for (var hostJson of minionHostsDetails) {
                if (hostJson.leaderId === leaderId) {
                    hostJson.trainingSessions.push(sessionId);
                }
            }
        }
    },
    removeFromTrainingSessions: function (sessionId, leaderId) {
        if ((!genUtils.isEmpty(sessionId)) && (!genUtils.isEmpty(leaderId))) {
            for (var hostJson of minionHostsDetails) {
                if (hostJson.leaderId === leaderId) {
                    var index = hostJson.trainingSessions.indexOf(sessionId);
                    if (index != -1) {
                        hostJson.trainingSessions.splice(index, 1);
                    }
                }
            }
        }
    },
    addToRunningSessions: function (sessionId, leaderId) {
        if ((!genUtils.isEmpty(sessionId)) && (!genUtils.isEmpty(leaderId))) {
            for (var hostJson of minionHostsDetails) {
                if (hostJson.leaderId === leaderId) {
                    hostJson.runningSessions.push(sessionId);
                }
            }
        }
    },
    removeFromRunningSessions: function (sessionId, leaderId) {
        if ((!genUtils.isEmpty(sessionId)) && (!genUtils.isEmpty(leaderId))) {
            for (var hostJson of minionHostsDetails) {
                if (hostJson.leaderId === leaderId) {
                    var index = hostJson.runningSessions.indexOf(sessionId);
                    if (index != -1) {
                        hostJson.runningSessions.splice(index, 1);
                    }
                }
            }
        }
    },
    lookupSessions: function (sessionId, callback, callbackParams) {
        if (runningSessionLookupMap[sessionId] === undefined) {
            // Hit the database to update the cache.
            var options = {
                url: config[process.env.environment].coreApiEndpoint + "/api/gru/lookupmap/" + config[process.env.environment].mode + "/" + sessionId,
                method: 'GET'
            };

            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    var dbResponse = JSON.parse(body);
                    if (genUtils.isEmpty(dbResponse.minion_id)) {
                        callbackParams.resobj.json({ status: "error", message: "Session id not found in any minion." });
                    } else {
                        memoryOperations.addToLookupSessions(sessionId, dbResponse.minion_id, false);
                        callbackParams["minionid"] = dbResponse.minion_id;
                        callback(callbackParams);
                    }
                } else {
                    callbackParams.resobj.json({ status: "error", message: "Error while trying to contact core for routing map lookup on cache miss." });
                }
            });
        } else {
            callbackParams["minionid"] = runningSessionLookupMap[sessionId];
            callback(callbackParams);
        }
    },
    addToLookupSessions: function (sessionId, minionId, dbCreate) {
        runningSessionLookupMap[sessionId] = minionId;

        if (dbCreate){
            // Update the database as well
            var options = {
                url: config[process.env.environment].coreApiEndpoint + "/api/gru/lookupmap/create",
                method: 'POST',
                json: {
                    sessionid: sessionId,
                    minionid: minionId,
                    mode: config[process.env.environment].mode
                }
            };

            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {

                }
            });
        }
    },
    removeFromLookupSessions: function (sessionId) {
        var minionId = runningSessionLookupMap[sessionId];
        if (!genUtils.isEmpty(minionId)) {
            delete runningSessionLookupMap[sessionId];

            // Update the database as well
            var options = {
                url: config[process.env.environment].coreApiEndpoint + "/api/gru/lookupmap/delete",
                method: 'POST',
                json: {
                    sessionid: sessionId,
                    minionid: minionId,
                    mode: config[process.env.environment].mode
                }
            };

            request(options, function (error, response, body) {
            });
        }
    },
    getLeaderWithTrainingSession: function (sessionId) {
        var leaderId = null
        for (var hostJson of minionHostsDetails) {
            if (hostJson.trainingSessions.indexOf(sessionId) >= 0) {
                leaderId = hostJson.leaderId;
                break;
            }
        }

        return leaderId;
    },
    getLeaderWithRunningSession: function (sessionId) {
        var leaderId = null
        for (var hostJson of minionHostsDetails) {
            if (hostJson.runningSessions.indexOf(sessionId) >= 0) {
                leaderId = hostJson.leaderId;
                break;
            }
        }

        return leaderId;
    },
    getLeaderWithSession: function (sessionId) {
        var leaderId = null
        for (var hostJson of minionHostsDetails) {
            if ((hostJson.trainingSessions.indexOf(sessionId) >= 0) || (hostJson.runningSessions.indexOf(sessionId) >= 0)) {
                leaderId = hostJson.leaderId;
                break;
            }
        }

        return leaderId;
    },
    getAllHostDetails: function () {
        return minionHostsDetails;
    }

}


module.exports = memoryOperations;
