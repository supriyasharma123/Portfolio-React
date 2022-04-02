const express = require("express");
const PORT = process.env.PORT || 4000;
const cors = require("cors");
const app = express();
var nodemailer = require('nodemailer');
const bodyParser = require("body-parser");

app.use(cors());

var jsonParser = bodyParser.json()

let sendMail = async(req,res) => {
    let data = req.body ;
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'portfoliodmrt2002@gmail.com',
          pass: 'portfolio'
        }
      });
       
      var mailOptions = {
        from: data.gmail,
        to: 'dmrtushar@gmail.com',
        subject: `Message from ${data.fname}`,
        html:
        `<h3>Informations</h3>
           <ul>
           <li>Name: ${data.fname}</li>
           <li>lastname: ${data.lname}</li>
           <li>Email: ${data.email}</li>
           </ul>
           <h3>Message</h3>
           <p>${data.message}</p>`
      };
       
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
}

app.use(express.static(__dirname + "/build/"));
app.get("*" , (req,res) => {
  res.sendFile(__dirname + "/build/index.html");
});

app.post("/send", jsonParser, sendMail);

  app.listen(PORT, () => {
    console.log(`App is running on` +  PORT);
  });