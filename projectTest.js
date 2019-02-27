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
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var app = express();
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//POST setup
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//MySQL setup
var mysql = require('./dbcon.js');
app.set('mysql', mysql);

//Session setup
var session = require('express-session');
app.use(session({secret: 'TabitNotSoSecret', resave: true, saveUninitialized:true}));

//other settings
app.use('/static', express.static('public'));
app.set('port', process.argv[2]);

//render the login page
app.get('/', function(req, res){
  res.render('genHome');
})

//POST request to confirm login info, login coding adapted from https://codeshack.io/basic-login-system-nodejs-express-mysql
app.post('/', function(req, res){
  mysql.pool.query("SELECT * FROM users WHERE email=? AND password=?", [req.body.email, req.body.password], function(error, results, fields){
    if(error){
      res.write(JSON.stringify(error));
      res.end();
    }
    if(results.length > 0){
      req.session.loggedin =true;
      req.session.context= results[0];
      
      if(results[0].admin_flag == 1){ //if admin go to admin home
        res.redirect('/manageusers');
      }
      else{
        res.redirect('/userHome');  //else go to userhome
      }
    }
    else{
      res.send("Incorrect user name and/or password");
    }
  })
})
//page for logging out
 app.get('/logout', function(req, res){
    req.session.destroy(function(error){
      if(error){
        console.log(error);
      }
      else{
        res.redirect('/');
      }
    });
  })
app.use('/userHome', require('./userHome.js'));
app.use('/manageusers', require('./adminHome.js'));

app.use(function(req,res){
    res.status(404);
    res.render('404');
  });
  
  app.use(function(err, req, res, next){
    console.error(err.stack);
    res.type('plain/text');
    res.status(500);
    res.render('500');
  });

  app.listen(app.get('port'), function(){
    console.log('Express started on localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
  });