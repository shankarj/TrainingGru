var genUtils = require('utils/general.js');

// This variable is for quick lookup during sandbox calls for deployed services.
var runningSessionLookupMap = {};

// Details of all the hosts with minions running in them. 
var minionHostsDetails = [
    {
        leaderId: "sampleHostUrl:port",
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
            for (var hostJson in minionHostsDetails) {
                if (hostJson.leaderId === leaderId) {
                    hostJson.trainingSessions.push(sessionId);
                }
            }
        }
    },
    lookupSessions: function (sessionid) {
        if (runningSessionLookupMap[sessionid] === undefined) {
            return null;
        } else {
            return runningSessionLookupMap[sessionid].minionUrl;
        }
    },
    getLeaderWithTrainingSession: function (sessionId) {
        var leaderId = null
        for (var hostJson in minionHostsDetails) {
            if (hostJson.trainingSessions.indexOf(sessionId) >= 0) {
                leaderId = hostJson.leaderId;
                break;
            }
        }

        return leaderId;
    },
    getLeaderWithRunningSession: function (sessionId) {
        var leaderId = null
        for (var hostJson in minionHostsDetails) {
            if (hostJson.runningSessions.indexOf(sessionId) >= 0) {
                leaderId = hostJson.leaderId;
                break;
            }
        }

        return leaderId;
    },
    getLeaderWithSession: function (sessionId) {
        var leaderId = null
        for (var hostJson in minionHostsDetails) {
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
