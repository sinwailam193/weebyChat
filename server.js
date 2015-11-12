var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var passport = require('passport');
var flash = require('connect-flash');
var http = require('http');
var port = process.env.PORT || 3000;
var app = express();
var server = http.Server(app);//need to set it up this way for socket.io
var io = require('socket.io')(server);//require socket.io
server.listen(port);

require('./server/passport')(passport);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret: 'shh this is a secret',
  saveUninitialized: true,
  resave: true,
  cookie: { maxAge: 3600000 }
}));
app.use(passport.initialize()); //start passport
app.use(passport.session());
app.use(flash());
app.use(express.static(__dirname + '/public')); //set the path to use the css files inside public

app.set('views', __dirname + '/views')// change the file path of the template
app.set('view engine', 'ejs');

require('./server/route')(app, passport);

console.log("listening on " + port);