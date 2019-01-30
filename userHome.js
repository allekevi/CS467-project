module.exports = function(){
    var express = require('express');
    var router = express.Router();
    
    router.get('/', function(req, res){
        res.render('userHome', {layout : 'user'});
    });

    router.get('/editProfile', function(req, res){
        res.render('editProfile', {layout : 'user'});
    });
    return router;

}();