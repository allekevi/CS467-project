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

    router.get('/', isLoggedIn, function (req, res) {  
        //populate current users table
        function getUserTable(res, mysql, context, complete) {
            var sql = "SELECT users.user_id, users.first_name, users.last_name, users.email, users.admin_flag AS admin, CASE WHEN userawards.awards IS NULL THEN 0 ELSE userawards.awards END AS awards FROM tabitcapstone.users LEFT JOIN(SELECT user_id, COUNT(award_id) AS awards FROM tabitcapstone.user_awards WHERE active_flag = 1 GROUP BY user_id) AS userawards ON tabitcapstone.users.user_id = userawards.user_id WHERE users.active_flag = 1 AND users.user_id != ?";
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
    Add User Page
    ********************************************************************************************************/
   router.get('/adduser', isLoggedIn, function(req, res){
       res.render('addUser');
   });
    //add user
    router.post('/adduser', isLoggedIn, function (req, res) {
        var mysql = req.app.get('mysql');
        var sql = "INSERT tabitcapstone.users SET users.first_name = ?, users.last_name = ?, users.email=?, users.admin_flag = ?, users.password = ?, users.created_by = ?, create_date = ?, users.modified_by = ?, modified_date = ?, active_flag=1";
        var d = new Date().toISOString().slice(0, 19).replace('T', ' ');
        var pass = 0
        if (req.fields.password == "") {
            pass = req.session.context.password;
        }
        else {
            pass = req.fields.password;
        }
        
        var inserts = [req.fields.first_name, req.fields.last_name, req.fields.email, req.fields.admin_flag, pass, req.session.context.user_id, d, req.session.context.user_id, d];
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
        var pass = 0
        if (req.fields.password == "") {
            pass = req.session.context.password;
        }
        else {
            pass = req.fields.password;
        }
        var inserts = [req.fields.first_name, req.fields.last_name, pass, req.session.context.user_id, d, req.session.context.user_id];
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

    /********************************************************************************************************
    Analytics Trend Page  
    ********************************************************************************************************/
    //load function, use persisted identity
    router.get('/analyticstrend', isLoggedIn, function (req, res) {
        //Placeholder function
        function dummy(res, mysql, context, id, complete) {
            var sql = "SELECT time.year FROM tabitcapstone.time WHERE time.year <= YEAR(NOW()) GROUP BY time.year ORDER BY time.year DESC";
            mysql.pool.query(sql, function (error, results, fields) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.years = results;
                complete();
            });

            sql = "SELECT awards.award_id, awards.award_name FROM tabitcapstone.awards WHERE awards.active_flag = 1 ORDER BY awards.award_id ASC";
            mysql.pool.query(sql, function (error, results, fields) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.types = results;
                complete();
            });

            sql = "SELECT users.user_id, CONCAT(users.first_name, ' ', users.last_name) AS name FROM tabitcapstone.users WHERE users.active_flag = 1 ORDER BY users.user_id ASC";
            mysql.pool.query(sql, function (error, results, fields) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.users = results;
                complete();
            });
        }

        //populate page
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        dummy(res, mysql, context, req.params.id, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 3) {
                context.layout = 'admin';
                res.render('analyticstrend', context);
            }
        }
    });

    router.get('/trenddata/:id/:type/:recipient/:grantor', isLoggedIn, function (req, res) {
        //Placeholder function
        function dummy(res, mysql, context, id, type, recipient, grantor, complete) {
            var sql = "SELECT CONCAT(time.month_name, ', ', time.year) AS calendar_month, ifnull(A.awardnum, 0) AS awardNum FROM tabitcapstone.time LEFT JOIN (SELECT CONCAT(YEAR(user_awards.created_date), '-', MONTH(user_awards.created_date)) AS mydate, count(user_awards.user_award_id) AS awardnum FROM tabitcapstone.user_awards WHERE user_awards.active_flag = 1 AND user_awards.award_id LIKE ? AND user_awards.user_id LIKE ? AND user_awards.created_by LIKE ?) AS A ON CONCAT(YEAR(time.date), '-', MONTH(time.date)) = A.mydate WHERE time.year = ? ORDER BY time.date_id";
            var inserts = [type, recipient, grantor, id];
            mysql.pool.query(sql, inserts, function (error, results, fields) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.chartdata = results;
                complete();
            });
        }

        //populate page
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        dummy(res, mysql, context, req.params.id, req.params.type, req.params.recipient, req.params.grantor, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.send(context.chartdata);
            }
        }
    });

    /********************************************************************************************************
    Analytics Most Page  
    ********************************************************************************************************/
    //load function, use persisted identity
    router.get('/analyticsmost', isLoggedIn, function (req, res) {
        //Placeholder function
        function dummy(res, mysql, context, id, complete) {
            var sql = "SELECT time.year FROM tabitcapstone.time WHERE time.year <= YEAR(NOW()) GROUP BY time.year ORDER BY time.year DESC";
            mysql.pool.query(sql, function (error, results, fields) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.years = results;
                complete();
            });

            sql = "SELECT users.user_id, CONCAT(users.first_name, ' ', users.last_name) AS name FROM tabitcapstone.users WHERE users.active_flag = 1 ORDER BY users.user_id ASC";
            mysql.pool.query(sql, function (error, results, fields) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.users = results;
                complete();
            });
        }

        //populate page
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        dummy(res, mysql, context, req.params.id, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 2) {
                context.layout = 'admin';
                res.render('analyticsmost', context);
            }
        }
    });

    router.get('/mostdata/:id/:recipient/:grantor', isLoggedIn, function (req, res) {
        //Placeholder function
        function dummy(res, mysql, context, id, recipient, grantor, complete) {
            var sql = "SELECT awards.award_name, COUNT(user_awards.user_award_id) AS award_count FROM tabitcapstone.user_awards LEFT JOIN tabitcapstone.awards ON user_awards.award_id = awards.award_id WHERE user_awards.active_flag = 1 AND YEAR(user_awards.award_date) = ? AND user_awards.user_id LIKE ? AND user_awards.created_by LIKE ? GROUP BY awards.award_name ORDER BY award_count DESC";
            var inserts = [id, recipient, grantor];
            mysql.pool.query(sql, inserts, function (error, results, fields) {
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }
                context.chartdata = results;
                complete();
            });
        }

        //populate page
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        dummy(res, mysql, context, req.params.id, req.params.recipient, req.params.grantor, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.send(context.chartdata);
            }
        }
    });

    /********************************************************************************************************
    Analytics Feedback Page  
    ********************************************************************************************************/
    //load function, use persisted identity
    router.get('/analyticsfeedback', isLoggedIn, function (req, res) {
        //Placeholder function
        function dummy(res, mysql, context, id, complete) {
            complete();
        }

        //populate page
        var callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        dummy(res, mysql, context, req.params.id, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                context.layout = 'admin';
                res.render('analyticsfeedback', context);
            }
        }
    });

    return router;

}();
