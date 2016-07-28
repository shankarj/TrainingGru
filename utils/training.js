var request = require('request');
var config = require('../config.js');
var memory = require('../memory.js');

var utilMethods = {
	deleteSession : function (sessionId, minionId, resObject, callCreateNext){
		var minionLeaderUrl = "http://" + minionId.split(":")[0] + ":" + config[process.env.environment].leaderMinionPort;
		var options = {
        	url :  minionLeaderUrl + "/delete/",
        	method : 'POST',
			json: {
				"sessionid": sessionId,
				"authtoken": ""
			}
      	};

      	request(options, function (error, response, body) {
			var successDelete = false;
        	if (!error && response.statusCode == 200) {
				successDelete = true;
            	if (callCreateNext){
					utilMethods.createSession(sessionId, resObject);
				}
        	}
			
			if ((!callCreateNext) && (resObject != null)){
				var retMsg = successDelete ? "Deleted successfully : " + sessionId : "Delete failed : " + sessionId;
				resObject.json({ status : "success", message : retMsg});
			}
      	});        
	},
	createSession : function(sessionId, resObject){
		var allMinionHosts = memory.getAllHostDetails();
		var strategy = config[process.env.environment].scheduleStrategy;
		
		if ((allMinionHosts.length == 1)){
			if (strategy === "force"){
				
			}
		}else {
			for (var hostId in allMinionHosts){
			
			}
		}
	}
};

module.exports = utilMethods;