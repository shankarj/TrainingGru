var express = require('express');
var router = express.Router();
var database = require('../../database.js');

router.get('/:sessionid', function(req, res, next) {
  if (req.params.sessionid === undefined){
    response = { status : "error", message : "One or more required params not provided for run."}
    res.json(response);
  }else{
    
  }
});



module.exports = router;
