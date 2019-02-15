module.exports = function(){
    var express = require('express');
    var router = express.Router();
    var transporter = require('./mailer.js');
    var latex = require('node-latex');
    var fse = require('fs-extra');
    
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
                context.layout = 'user';
                res.render('userhome', context);
            }
        }
       
    });

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
                context.layout = 'user';
                res.render('editProfile', context);
            }
        }

    });

    //router for editing profile
    router.put('/editProfile/:id', isLoggedIn, function(req, res){
        var mysql = req.app.get('mysql');
        var context = [req.body.first_name, req.body.last_name, req.body.email, req.body.password, req.params.id];
        var sql = "UPDATE users SET first_name=?, last_name=?, email=?, password=? WHERE user_id=?"
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

    //get router for displaying page
    router.get('/newAward', isLoggedIn, function(req, res){
        res.render('newAward', {layout: 'user'});
    });
    //post router to add award to DB
    router.post('/newAward', isLoggedIn, function(req, res){
        /*var mysql = req.app.get('mysql');
        var sql = 'INSERT INTO awards (name, type, date, by) VALUES(?,?,?,?)';
        var data = [req.body.name, req.body.type, req.body.date, req.body.by];
        sql = mysqp.pool.query(sql, data, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            else{
                //create award
                var options ={
                    args: ["\\def\\recName{"+ req.body.name +"}",
                            '\\def\\date{'+ req.body.date +'}',
                            '\\def\\givenBy{'+ req.body.by +'}',
                            '\\def\\sig{}]
                    inputs: './public/'+ req.body.by +'.jpg'
                }
                if(req.body type == "EOM"){
                    var input = fse.createReadStream('EOM.tex');
                    var output = fse.createWriteStream('award.pdf');
                    latex(input, options).pipe(output);
                }
                else{
                    var input = fse.createReadStream('Contrabution.tex');
                    var output = fse.createWriteStream('award.pdf');
                    latex(input, options).pipe(output); 
                }
                //email award
                var mailoptions={
                    from ='476Kudos@gmail.com',
                    to = '476Kudos@gmail.com',          //test email, change to email recipient
                    subject='You have a new award',
                    text='New award is the attached file'
                    attachments: [{path: './award.pdf'}]
                };
                transporter.sendMail(mailoptions, function(error, info){
                    if(error){
                        console.log(error);
                    }
                });
                //redirect to home
                res.redirect('/userHome');
           }
        });*/
        
        var options = {
            args: ["\\def\\my_var{NOT TEST}"]
        }
        var output = fse.createWriteStream('/public/out.pdf');
        var input = fse.createReadStream('/public/EmpOMon.tex');
        var pdf = latex(input, options);
        pdf.pipe(output);
        pdf.on('error', err => console.error(err));
        res.redirect('/userHome');
    });
    
    return router;

}();