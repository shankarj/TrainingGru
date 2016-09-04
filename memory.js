var genUtils = require('./utils/general.js');

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
    addTrainingSessionToLeader: function (sessionId, leaderId) {
        if ((!genUtils.isEmpty(sessionId)) && (!genUtils.isEmpty(leaderId))) {
            for (var hostJson of minionHostsDetails) {
                if (hostJson.leaderId === leaderId) {
                    hostJson.trainingSessions.push(sessionId);
                }
            }
        }
    },
    removeTrainingSessionFromLeader: function (sessionId, leaderId) {
        if ((!genUtils.isEmpty(sessionId)) && (!genUtils.isEmpty(leaderId))) {
            for (var hostJson of minionHostsDetails) {
                if (hostJson.leaderId === leaderId) {
                    var index = hostJson.trainingSessions.indexOf(sessionId);
                    if (index != -1){
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
    lookupSessions: function (sessionId) {
        if (runningSessionLookupMap[sessionId] === undefined) {
            return null;
        } else {
            return runningSessionLookupMap[sessionId];
        }
    },
    addToLookupSessions: function(sessionId, minionId){
        runningSessionLookupMap[sessionId] = minionId;
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
