var express = require('express');
var bodyParser = require('body-parser');
var db = require('./mongoose');
var path = require('path');
var session = require('express-session');
var passport = require('passport');
var strategies = require('./config/strategies.js')

var app = express();

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase();
}

app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret:'3da6f15641a9a688457d114185f91ea907b4f7d5f793770baf5ae',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(strategies.serializeUser)
passport.deserializeUser(strategies.deserializeUser)
passport.use(strategies.localStrategy)

var apiCtrl = require("./api/")
app.use("/api", apiCtrl)

app.get('/*', function(req,res){
	res.sendFile(path.join(__dirname, 'public/index.html'))
})

var port = process.env.PORT || 3000;
var serverip = process.env.IP || "localhost";

app.listen(port, serverip);
console.log('Server running at '+serverip+":"+port);