"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
let express = require("express");
let session = require("express-session");
let app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
var mysql = require('mysql');
let mysqlConfig = {
    host: 'localhost',
    user: 'root',
    password: 'root1',
    database: 'appartementdb'
};
var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("Example app listening at http://%s:%s", host, port);
});
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
app.post("/testpost", (request, response) => {
    console.log(request.body.username);
    request.session.username = request.body.username;
    response.send("Username: " + request.body.username);
});
app.get("/isloggedin", (request, response) => {
    if (request.session.username) {
        response.send("Hi, " + request.session.username);
    }
    else {
        response.send("Not logged in");
    }
});
app.post('/login', (request, response) => {
    let connection = mysql.createConnection(mysqlConfig);
    connection.connect();
    let user = {
        "username": request.body.username,
        "password": request.body.password
    };
    connection.query("SELECT * from usertable WHERE username = ? AND password =?", [user.username, user.password], (error, results) => {
        if (error) {
            console.log("error ocurred", error);
            response.send({
                "code": 400,
                "failed": "error ocurred"
            });
        }
        else {
            if (results.length) {
                response.send("Login Successfull");
            }
            else {
                response.send("Login failed");
            }
        }
    });
});
app.post('/register', (request, response) => {
    let connection = mysql.createConnection(mysqlConfig);
    connection.connect();
    let user = {
        "username": request.body.username,
        "password": request.body.password,
        "email": request.body.email
    };
    connection.query('INSERT INTO usertable SET ?', user, (error, results, fields) => {
        if (error) {
            console.log("error ocurred", error);
            response.send({
                "code": 400,
                "failed": "error ocurred"
            });
        }
        else {
            console.log('The solution is: ', results);
            response.send({
                "code": 200,
                "success": "user registered sucessfully"
            });
        }
    });
});
//# sourceMappingURL=index.js.map