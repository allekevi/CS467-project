/********************************************************************************************************
Team: Tabit
Authors: Kevin Allen, Lonnie Clark, Christina Curran
Date: 2/8/2018
Class: CS467, Section 400
********************************************************************************************************/

/********************************************************************************************************
Variable Setup
********************************************************************************************************/
// express/handlebar setup
var express = require('express');
var app = express();
var handlebars = require('express-handlebars').create({ defaultLayout: 'main' });

// POST setup
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//mySQL setup
var mysql = require('./dbcon.js');
app.set('mysql', mysql);

// set app, allow parameter for port in node set-up
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.argv[2]);

app.use('/static', express.static('public'));

/********************************************************************************************************
Manage Users Page
********************************************************************************************************/
//load function
app.get('/manageusers', function (req, res) {
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
app.delete('/manageusers/:id', function (req, res) {
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
app.get('/editprofile', function (req, res) {
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
            res.render('editprofile', context);
        }
    }
});

//edit user
app.post('/editprofile', function (req, res) {
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
app.get('/edituser/:id', function (req, res) {
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
            res.render('edituser', context);
        }
    }
});

//edit user
app.post('/edituser/:id', function (req, res) {
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

/********************************************************************************************************
Error Handling & Misc.
********************************************************************************************************/
// when use path not found, render 404 page
app.use(function (req, res) {
    res.status(404);
    res.render('404');
});

// when use has error, render 500 page
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
});

// when site stood up
app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});