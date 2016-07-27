var runningSessionDetails = {};
var minionHosts = {};

var memoryOperations = {
    getMinionUrlRunningSessionId : function (sessionid) {
        if (runningSessionDetails[sessionid] === undefined){
            return null;
        }else{
            return runningSessionDetails[sessionid].minionUrl;
        }
    },
    
}


module.exports = memoryOperations;
