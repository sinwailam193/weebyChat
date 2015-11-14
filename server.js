//requiring all the tools that will be used
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var passport = require('passport');
var flash = require('connect-flash');
var http = require('http');
//-------------------------------------------

var port = process.env.PORT || 3000; //set up the port, when we upload it to heroku, heroku will have their own port
var app = express(); //invoking express framework
var server = http.Server(app);//set up the server with express
var io = require('socket.io')(server);//require socket.io and connect socket.io with the server
server.listen(port); //the server will be listening at 3000 locally

require('./server/passport')(passport); //this is the file that will handle the authentication and we pass the object passport into it

app.use(morgan('dev')); //used for logging request details
app.use(cookieParser()); //parses cookie header and populate the req.cookie 
app.use(bodyParser.json()); // takes care of turning your request data into a JavaScript object on the server automatically.
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({ //use the session set up by express-session middleware
  secret: 'shh this is a secret',
  saveUninitialized: true,
  resave: true,
  cookie: { maxAge: 3600000 } // user won't have to log in for an hour
}));
app.use(passport.initialize()); //start passport by initializing it
app.use(passport.session()); //attach passport to the current session
app.use(flash()); //invoking connect-flash
app.use(express.static(__dirname + '/public')); //set the path to use the files inside public

app.set('views', __dirname + '/views')// change the file path of the template
app.set('view engine', 'ejs'); //set the template engine using ejs

require('./server/route')(app, passport); //this files handles the GET, POST requests and we will pass in the app and passport objects in
require('./server/socket')(io); //this files handles the socket.io event listeners. 

console.log("listening on " + port); //logging into the console of what port the server is listening on