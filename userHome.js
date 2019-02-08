module.exports = function(){
    var express = require('express');
    var router = express.Router();
    var transporter = require('./mailer.js');
    var latex = require('node-latex');
    var fse = require('fs-extra');
   /* 
    function getUserAwardNum(res, mysql, context, id, complete){
        var sql= "SELECT COUNT() FROM Award WHERE userId = ?";
        var data=[id];
        mysql.pool.query(sql, data, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            else{
                context.total = results[0];
                complete();
            }
           
        });
    }
*/
    router.get('/', function(req, res){
        var context ={};
        var callbackcount=0;
       // var mysql = req.app.get('mysql');
       // getUserAwardNum(res, mysql, context, id, complete);
       // function complete(){
         //   callbackcount++;
           // if(callbackcount >= 3){
            //    res.render('userhome', context, {layout : 'user'});
           // }
       // }
        res.render('userHome', {layout : 'user'});
    });

    router.get('/editProfile', function(req, res){
        res.render('editProfile', {layout : 'user'});
    });

    //get router for displaying page
    router.get('/newAward', function(req, res){
        res.render('newAward', {layout: 'user'});
    });
    //post router to add award to DB
    router.post('/newAward', function(req, res){
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
        var output = fse.createWriteStream('out.pdf');
        var input = fse.createReadStream('EmpOMon.tex');
        var pdf = latex(input, options);
        pdf.pipe(output);
        pdf.on('error', err => console.error(err));
        res.redirect('/userHome');
    });
    
    return router;

}();