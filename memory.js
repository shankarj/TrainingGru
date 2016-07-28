var runningSessionRouteMap = {};
var minionHostsDetails = [];

var memoryOperations = {
    getMinionUrlRunningSessionId : function (sessionid) {
        if (runningSessionRouteMap[sessionid] === undefined){
            return null;
        }else{
            return runningSessionRouteMap[sessionid].minionUrl;
        }
    },
    getAllHostDetails : function(){
        return minionHostsDetails;
    }
    
}


module.exports = memoryOperations;
