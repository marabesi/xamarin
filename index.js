var express = require('express'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    morgan = require('morgan'),
    restful = require('node-restful'),
    mongoose = restful.mongoose,
    ObjectId = require('mongodb').ObjectId; ;
var app = express();

if (fs.existsSync('.env')) {
    require('dotenv').config();
}

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type:'application/vnd.api+json'}));
app.use(methodOverride());

var user = process.env.DB_USER,
    password = process.env.DB_PASSWORD,
    host = process.env.DB_HOST,
    port = process.env.PORT || 8000,
    database = process.env.DB_DATABASE;

if (user == "" && password == "") {
    mongoose.connect("mongodb://" + host + "/" + database);
} else {
    mongoose.connect("mongodb://" + user + ":" + password + "@" + host);
}

var Users = app.users = restful.model('users', mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    password: String,
    email: String,
  }))
  .methods(['get', 'post', 'put', 'delete'])
  .before('get', verifyToken)
  .before('post', verifyToken)
  .before('put', verifyToken)
  .before('delete', verifyToken);

Users.register(app, '/users');

var Sensors = app.sensors = restful.model('sensors', mongoose.Schema({
    name: String,
    description: String,
    type_id: Intl,
    state: Boolean,
    port: String
}))
.methods(['get', 'post', 'put', 'delete'])
.before('get', verifyToken)
.before('post', verifyToken)
.before('put', verifyToken)
.before('delete', verifyToken);

Sensors.register(app, '/sensors');

function verifyToken(req, res, next) {
    var token = req.query.token;

    if (!ObjectId.isValid(token)) {
        throw new Error('Type of token sent is invalid');
    }

    var id = new ObjectId(token);
    
    var user = Users.findById(id, function(error, userFound) {
        if (error) {
            throw new Error('Something went wrong, try again later');;
        }
        
        if (!userFound) {
            throw new Error('fail to verify token');
        }

        if (token != userFound._id) {
            throw new Error('Invalid token');
        }
    });

    next();
}


app.listen(port);
