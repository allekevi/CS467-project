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
            var sql = "SELECT users.user_id, users.first_name, users.last_name, users.email, users.admin_flag AS admin, CASE WHEN userawards.awards IS NULL THEN 0 ELSE userawards.awards END AS awards FROM tabitcapstone.users LEFT JOIN(SELECT user_id, COUNT(distinct(award_id)) AS awards FROM tabitcapstone.user_awards WHERE active_flag = 1 GROUP BY user_id) AS userawards ON tabitcapstone.users.user_id = userawards.user_id WHERE users.active_flag = 1 AND users.user_id != ?";
            var inserts = [req.session.context.user_id];
            mysql.pool.query(sql, inserts, function (error, results, fields) {
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
    router.delete('/:id', isLoggedIn, function (req, res) {
        var mysql = req.app.get('mysql');
        var sql = "UPDATE tabitcapstone.users SET users.active_flag = 0, modified_by = ?, modified_date = ? WHERE user_id = ?";
        var d = new Date().toISOString().slice(0, 19).replace('T', ' ');
        var inserts = [req.session.context.user_id, d, req.params.id];
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
            var sql = "SELECT users.user_id, users.first_name, users.last_name, users.email FROM tabitcapstone.users WHERE users.user_id = ?";
            var inserts = [req.session.context.user_id];
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
        var sql = "UPDATE tabitcapstone.users SET users.first_name = ?, users.last_name = ?, users.password = ?, users.modified_by = ?, modified_date = ? WHERE users.user_id = ?";
        var d = new Date().toISOString().slice(0, 19).replace('T', ' ');
        var inserts = [req.fields.first_name, req.fields.last_name, req.fields.password, req.session.context.user_id, d, req.session.context.user_id];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end()
            } else {
                res.redirect('/manageusers');
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
        var sql = "UPDATE tabitcapstone.users SET users.first_name = ?, users.last_name = ?, users.modified_by = ?, users.modified_date = ? WHERE users.user_id = ?";
        var d = new Date().toISOString().slice(0, 19).replace('T', ' ');
        var inserts = [req.fields.first_name, req.fields.last_name, req.session.context.user_id, d, req.fields.id];
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