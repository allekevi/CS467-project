
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service : 'gmail',
    auth: {
      user: '476Kudos',
      pass: "KudosTest"
  
    }
  });

  module.exports = transporter;