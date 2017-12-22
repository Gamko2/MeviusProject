"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
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
};
var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log("App listening at http://%s:%s", host, port);
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
let isAuthenticated = (request, response, next) => {
    if (request.session.user) {
        next();
    }
    else {
        response.send({ "error": 401, "message": "Unauthorized" });
    }
};
app.put("/appartement", isAuthenticated, (request, response) => {
    let updatequery = "UPDATE appartements SET ";
    let connection = mysql.createConnection(mysqlConfig);
    connection.connect();
    for (let key in request.body) {
        if (key != "id") {
            let value = request.body[key];
            updatequery = updatequery + key + "= '" + value + "', ";
        }
    }
    updatequery = updatequery.substr(0, updatequery.length - 2);
    updatequery = updatequery + " WHERE ID=" + request.body.id;
    console.log(updatequery);
    connection.query(updatequery, (error, results, fields) => {
        if (error) {
            console.log("error ocurred", error);
            response.send({
                "code": 400,
                "failed": "error ocurred"
            });
        }
        else {
            response.send({
                "code": 200,
                "success": "Appartement updated successfully"
            });
        }
    });
});
app.post("/postappartement", isAuthenticated, (request, response) => {
    let connection = mysql.createConnection(mysqlConfig);
    connection.connect();
    let sql = "INSERT into appartements (objecttype,rooms,squaremeter,price,extra,plz,ort,contact) VALUES ?";
    let values = [
        [request.body.objecttype, request.body.rooms, request.body.squaremeter, request.body.price,
            request.body.extra, request.body.plz, request.body.ort, request.session.user.id]
    ];
    connection.query(sql, [values], (error, results, fields) => {
        if (error) {
            console.log("error ocurred", error);
            response.send({
                "code": 400,
                "failed": "error ocurred"
            });
        }
        else {
            console.log("The Solution is: ", results);
            response.send({
                "code": 200,
                "success": "Appartement added successfully"
            });
        }
    });
});
app.post("/testpost", (request, response) => {
    console.log(request.body.username);
    request.session.username = request.body.username;
    response.send("Username: " + request.body.username);
});
app.get("/isloggedin", isAuthenticated, (request, response) => {
    let tmp = Object.assign({}, request.session.user);
    delete tmp.password;
    response.send(tmp);
});
app.post('/logout', isAuthenticated, (request, response) => {
    delete request.session.user;
    response.send("Logout Successfull");
});
app.post('/login', (request, response) => {
    let connection = mysql.createConnection(mysqlConfig);
    connection.connect();
    let user = {
        "username": request.body.username,
        "password": request.body.password
    };
    connection.query("SELECT * from usertable WHERE username = ? ", [user.username], (error, results) => {
        if (error) {
            console.log("error ocurred", error);
            response.send({
                "code": 400,
                "failed": "error ocurred"
            });
        }
        else {
            if (results[0].password.length) {
                bcrypt.compare(user.password, results[0].password, (err, result) => {
                    if (result) {
                        request.session.user = results[0];
                        response.send("Login Successfull");
                    }
                    else {
                        response.send("Login failed");
                    }
                });
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
    console.log(user.password);
    bcrypt.hash(user.password, saltRounds, (err, hash) => {
        user.password = hash;
        console.log(user.password);
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
});
//# sourceMappingURL=index.js.map