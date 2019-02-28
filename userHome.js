module.exports = function(){
    var express = require('express');
    var router = express.Router();
    var transporter = require('./mailer.js');
    var latex = require('node-latex');
    var fse = require('fs-extra');
    
    //get the number of awards for current user
    function getUserAwardNum(res, mysql, context, id, complete){
        var sql= "SELECT COUNT(*) AS total FROM user_awards WHERE user_id = ?";
        var data= id;
        mysql.pool.query(sql, data, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            else{
                context.total = results[0].total;
                complete();
            }
           
        });
    }
    //get a list of users capable of getting awards
    function getUsers(res, mysql, context, complete){
        mysql.pool.query("SELECT user_id, first_name, last_name FROM users WHERE admin_flag=0", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            else{
                context.users = results;
                complete()
            }
        });
    }
    //get list of awards
    function getAwardList(res, mysql, context, complete){
        mysql.pool.query("SELECT award_id, award_name FROM awards WHERE award_id=1 OR award_id=2", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            else{
                context.awardNames = results;
                complete()
            }
        });
    }
    //get info on a user
    function getUserInfo(res, mysql, context, id, complete){
        mysql.pool.query("SELECT * FROM users WHERE user_id=?", id, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            else{
                context.user = results[0];
                complete();
            }
        })
    }
    //get awards to populate manage awards page
    function getAwardsBySend(res, mysql, context, id, complete){    // V fix below V need to get awardee name
        var sql = "SELECT a.award_name, DATE_FORMAT(ua.award_date, '%Y-%m-%d') as award_date, u.first_name, u.last_name FROM user_awards ua INNER JOIN awards a ON a.award_id = ua.award_id INNER JOIN users u ON ua.user_id = u.user_id WHERE ua.created_by=?";
        mysql.pool.query(sql, id, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            else{
                context.awards = results;
                console.log(context.awards);
                complete();
            }
        })

    }
    //function to make sure session is still active
    function isLoggedIn(req, res, next){
        if(req.session.loggedin){
            return next();
        }
        else{
            res.redirect('/');
        }
    }
    //set up user home page
    router.get('/', isLoggedIn, function(req, res){
        var id = req.session.context.user_id;
        var context={};
        var callbackcount=0;
        var mysql = req.app.get('mysql');
        getUserAwardNum(res, mysql, context, id, complete);
        getUserInfo(res, mysql, context, id, complete)
        
        function complete(){
            callbackcount++;
            if(callbackcount >= 2){
                context.layout = 'admin';
                res.render('userhome', context);
            }
        }
       
    });
    //page to manage awards given by current user
    router.get('/manageawards', isLoggedIn, function(req, res){
        var mysql = req.app.get('mysql');
        var context={};
        context.jsscripts =["deleteAward"];
        var callbackcount=0;
        var id = req.session.context.user_id;
        getAwardsBySend(res, mysql, context, id, complete);
        function complete(){
            callbackcount++;
            if(callbackcount >=1){
                res.render('manageawards', context);
            }
        }
    });

    //setup for deleting award
    router.delete('/:id', isLoggedIn, function(req, res){
        var mysql = req.app.get('mysql');
        var id = [req.params.id];
        mysql.pool.query("DELETE FROM user_awards WHERE award_id =?", id, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            else{
                res.status(202).end();
            }
        });
    });
    //page for edit profile
    router.get('/editProfile', isLoggedIn, function(req, res){
        var mysql = req.app.get('mysql');
        var id = req.session.context.user_id;
        var context ={};
        var callbackcount=0;
        context.jsscripts = ["editUser.js"];
        getUserInfo(res, mysql, context, id, complete);
        function complete(){
            callbackcount++;
            if(callbackcount >= 1){
                context.layout = 'admin';
                res.render('editProfile', context);
            }
        }

    });

    //router for editing profile
    router.put('/editProfile/:id', isLoggedIn, function(req, res){
        var mysql = req.app.get('mysql');
        var context = [req.body.first_name, req.body.last_name, req.body.email, req.body.password, req.params.id];  //edit user signiture
        var sql = "UPDATE users SET first_name=?, last_name=?, email=?, password=? WHERE user_id=?"     //insert usert signiture
        mysql.pool.query(sql, context, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            else{
                res.status(200);
                res.end();
            }
        });
    });

    //get router for displaying newAward page
    router.get('/newAward', isLoggedIn, function(req, res){
        var mysql = req.app.get('mysql');
        var context ={};
        var callbackcount=0;
        getUsers(res, mysql, context, complete);
        getAwardList(res, mysql,context, complete);
        function complete(){
            callbackcount++;
            if(callbackcount >= 2){
                context.layout = 'admin';
                res.render('newAward', context);
            }
        }
        
    });
    //post router to add award to DB
    router.post('/newAward', isLoggedIn, function(req, res){
        var mysql = req.app.get('mysql');
        var id = req.session.context.user_id;
        req.body.createDate = new Date();
        var sql = 'INSERT INTO user_awards (user_id, award_id, award_date, created_by, created_date) VALUES(?,?,?,?,?)';
        var data = [req.body.name, req.body.aType, req.body.date, id,req.body.createDate];
        
        mysql.pool.query(sql, data, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            else{
                //create award
                //convert user_id to first name and last name
                var callbackcount =0;
                var recv={};
                var send={};
                getUserInfo(res, mysql, recv, req.body.name, complete)
                getUserInfo(res, mysql, send, req.session.context.user_id, complete)
                function complete(){
                    callbackcount++;
                    if(callbackcount>=2){
                        //process date string
                        var months = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
                        dateSplit = req.body.date.split("-");
                        req.body.year = dateSplit[0];
                        req.body.month = months[parseInt(dateSplit[1])-1];
                        req.body.day = dateSplit[2];
                        //insert data into latex form
                        var options ={                    //!!!!!!!!!!!!!!!!!!!!!!!!!!Still need to add sender signiture!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                            args: ["\\def\\monVar{"+req.body.month+" }\\def\\recvVar{"+recv.user.first_name+" "+recv.user.last_name+"}\\def\\dayVar{"+req.body.day+" }\\def\\yearVar{"+req.body.year+"}\\def\\sendVar{"+send.user.first_name+" "+send.user.last_name+"}\\def\\sendSig{JohnDoe}"],
                            errorLogs:"./public/error.txt"
                        }
                        // setup mail options
                        var mailoptions={
                            from:'467Kudos@gmail.com',
                            to: '467Kudos@gmail.com',    //recv.user.email      //test email, change to email recipient 
                            subject:'You have a new award',
                            text:'New award is the attached file',
                            attachments: [{path: './public/award.pdf'}]
                        };
                        //make Employee of the Month award
                        if(req.body.aType == "1"){
                            var input = fse.createReadStream('./public/EmpOfMon.tex');
                            var output = fse.createWriteStream('./public/award.pdf');
                            var pdf = latex(input, options).pipe(output);
                            pdf.on('error', err => console.error(err));
                            pdf.on('finish', () => {
                                //send email award
                                transporter.sendMail(mailoptions, function(error, info){
                                    if(error){
                                        console.log(error);
                                    }
                                });
                            });
                            res.redirect('/userHome');
                        }
                        //make Outstanding contribution award
                        else if(req.body.aType == "2"){
                            var input = fse.createReadStream('./public/OutCont.tex');
                            var output = fse.createWriteStream('./public/award.pdf');
                            var pdf = latex(input, options).pipe(output);
                            pdf.on('error', err => console.error(err));
                            pdf.on('finish', () => {
                                //send email award
                                transporter.sendMail(mailoptions, function(error, info){
                                    if(error){
                                        console.log(error);
                                    }
                                });
                            });
                            res.redirect('/userHome');
                        }
                    }
                }
            }
        });
 
    });
    
    return router;

}();