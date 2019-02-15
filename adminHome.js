module.exports = function(){
    var express = require('express');
    var router = express.Router();

    //function to make sure session is still active
    function isLoggedIn(req, res, next){
        if(req.session.loggedin){
            return next();
        }
        else{
            res.redirect('/');
        }
    }

    router.get('/', isLoggedIn, function (req, res) {  // return '/manageusers' here once/if admin home is created
        //populate current users table
        function getUserTable(res, mysql, context, complete) {
            mysql.pool.query("SELECT users.user_id, users.first_name, users.last_name, users.email, users.admin_flag AS admin, CASE WHEN userawards.awards IS NULL THEN 0 ELSE userawards.awards END AS awards FROM tabitcapstone.users LEFT JOIN ( SELECT user_id, COUNT(distinct(award_id)) AS awards FROM tabitcapstone.user_awards WHERE active_flag = 1 GROUP BY user_id) AS userawards ON tabitcapstone.users.user_id = userawards.user_id WHERE users.active_flag = 1", function (error, results, fields) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.user = results;
                complete();
            });
        }
    
        //populate page
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteEntity.js"];
        context.layout = 'admin';
        var mysql = req.app.get('mysql');
        getUserTable(res, mysql, context, complete);
    
        //ensure query comes back before render
        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('manageusers', context);
            }
        }
    });
    
    //delete function
    router.delete('/manageusers/:id', isLoggedIn, function (req, res) {
        var mysql = req.app.get('mysql');
        var sql = "UPDATE tabitcapstone.users SET users.active_flag = 0 WHERE user_id = ?";
    
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end()
            } else {
                res.status(202).end();
            }
        });
    });
    
    /********************************************************************************************************
    Edit Profile Page
    ********************************************************************************************************/
    //load function, use persisted identity
    router.get('/editprofile', isLoggedIn, function (req, res) {
        //retrieve single user
        function getSingleUser(res, mysql, context, id, complete) {
            var sql = "SELECT users.user_id, users.first_name, users.last_name, users.email FROM tabitcapstone.users WHERE users.user_id = 3";
            var inserts = [id];
            mysql.pool.query(sql, inserts, function (error, results, fields) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.user = results[0];
                complete();
            });
        }
    
        //populate page
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getSingleUser(res, mysql, context, req.params.id, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                context.layout = 'admin';
                res.render('editprofileadmin', context);
            }
        }
    });
    
    //edit user
    router.post('/editprofile', isLoggedIn, function (req, res) {
        var mysql = req.app.get('mysql');
        var sql = "UPDATE tabitcapstone.users SET users.first_name = ?, users.last_name = ?, users.password = ? WHERE users.user_id = 3";
    
        var inserts = [req.body.first_name, req.body.last_name, req.body.password];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end()
            } else {
                res.redirect('/editprofile');
            }
        });
    });
    
    /********************************************************************************************************
    Edit Others Page
    ********************************************************************************************************/
    //load function, with ID...
    router.get('/edituser/:id', isLoggedIn, function (req, res) {
        //retrieve single user
        function getSingleUser(res, mysql, context, id, complete) {
            var sql = "SELECT users.user_id, users.first_name, users.last_name, users.email FROM tabitcapstone.users WHERE users.user_id = ?";
            var inserts = [id];
            mysql.pool.query(sql, inserts, function (error, results, fields) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.user = results[0];
                complete();
            });
        }
    
        //populate page
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getSingleUser(res, mysql, context, req.params.id, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                context.layout = 'admin';
                res.render('edituseradmin', context);
            }
        }
    });
    
    //edit user
    router.post('/edituser/:id', isLoggedIn, function (req, res) {
        var mysql = req.app.get('mysql');
        var sql = "UPDATE tabitcapstone.users SET users.first_name = ?, users.last_name = ? WHERE users.user_id = ?";
    
        var inserts = [req.body.first_name, req.body.last_name, req.body.id];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end()
            } else {
                res.redirect('/manageusers');
            }
        });
    });
    

    return router;

}();