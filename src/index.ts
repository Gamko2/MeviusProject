import { Request, Response } from "express";
import * as bodyParser from "body-parser";
let bcrypt = require('bcrypt');
const saltRounds = 10;
let express = require("express");
let session = require("express-session");
let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var mysql = require('mysql');
let mysqlConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'appartementdb'
}



var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("App listening at http://%s:%s", host, port)
})

app.use(session({ secret: "geheim" }));
/*
let sess;
app.get('/', (req,res) =>{
    let connection = mysql.createConnection(mysqlConfig);
    connection.connect();
sess=req.session;
sess.email;
sess.username;

})*/

app.post("/testpost", (request: Request, response: Response) => {
  console.log(request.body.username);
  request.session.username = request.body.username;
  response.send("Username: " + request.body.username);
})

app.get("/isloggedin", (request: Request, response: Response) => {
  if (request.session.username) {
    response.send("Hi, " + request.session.username);
  } else {
    response.send("Not logged in");
  }
});

app.post('/logout', (request: Request, response: Response) =>{
delete request.session.user;
response.send ("Logout Successfull");

})

app.post('/login', (request: Request, response: Response) => {
  let connection = mysql.createConnection(mysqlConfig);
  connection.connect();
  let user = {
    "username": request.body.username,
    "password": request.body.password
  }
  connection.query("SELECT password from usertable WHERE username = ? ", [user.username], (error, results) => {
    if (error) {
      console.log("error ocurred", error);
      response.send({
        "code": 400,
        "failed": "error ocurred"
      })
    }
    else {
      if (results[0].password.length) {
        bcrypt.compare(user.password,results[0].password, (err, result)=>{
          if (result){
            request.session.user=user;
            response.send("Login Successfull");
          }
          else {
            response.send("Login failed");
          }
        })
        
      }
      
    }


  })
});



app.post('/register', (request: Request, response: Response) => {
  let connection = mysql.createConnection(mysqlConfig);
  connection.connect();
  let user = {
    "username": request.body.username,
    "password": request.body.password,
    "email": request.body.email
    
  }
  console.log(user.password);
  bcrypt.hash(user.password, saltRounds,  (err,hash) => {
    user.password=hash;
    console.log(user.password);
    connection.query('INSERT INTO usertable SET ?', user, (error, results, fields) => {
      if (error) {
        console.log("error ocurred", error);
        response.send({
          "code": 400,
          "failed": "error ocurred"
        })
      } else {
        console.log('The solution is: ', results);
        response.send({
          "code": 200,
          "success": "user registered sucessfully"
        });
      }
    });
  })
    


});





