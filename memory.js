var runningSessionDetails = {};
var minionDetails = {};
var minionHosts = {};

var memoryOperations = {
    getMinionUrlRunningSessionId : function (sessionid) {
        if (runningSessionDetails[sessionid] === undefined){
            return null;
        }else{
            return runningSessionDetails[sessionid].minionUrl;
        }
    },
    getTrainingSessionsInMinion : function (minionId) {
        if (minionDetails[minionId] === undefined){
            return null;
        }else{
            return minionDetails[minionId].trainingSessions;
        }
    },
    getRunningSessionsInMinion : function (minionId) {
        if (minionDetails[minionId] === undefined){
            return null;
        }else{
            return minionDetails[minionId].runningSessions;
        }
    },  
    getAllMinionIds : function () {
        var minionIds = [];
        for (var minionId in minionDetails){
            minionIds.push(minionId);
        }
        return minionIds;
    },
    getUrlForMinionId : function (minionId) {
        if (minionId === null){
            return null;
        }else{
            return minionDetails[minionId].minionUrl;
        }
    }
}


module.exports = memoryOperations;
