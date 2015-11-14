// requiring the local and facebook login strategies 
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var User = require('./mongo').User; //this files has the schema for storing users into the mongo database and we will require it

// this is requiring the facebook client id and client secret, and url to use for facebook authentication, in heroku environment, it will use their config file.
var appID = process.env.appID || require('./config').appID;
var secret = process.env.secret || require('./config').secret;
var url = process.env.url || require('./config').url;
//--------------------------------------------------------

module.exports = function(passport){

  passport.serializeUser(function(user, done){ // only the user ID is serialized to the session, keeping the amount of data stored within the session small.
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done){ // the whole object of the user information is retrieved with help of the id
    User.findById(id, function(err, user){
      done(err, user);
    });
  });

  passport.use('local-signup', new LocalStrategy({ //this is the local signup strategy, it checks if the username is already used, if not, user can signup with that username
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  },
    function(req, username, password, done){
      process.nextTick(function(){ //we use process.nextTick, a node js function, to defer the execution of an action till the next pass around the event loop
        User.findOne({'user.username': username}, function(err, user){
          if(err){
            return done(err);
          }
          if(user){
            return done(null, false, req.flash('signupMessage', 'Sorry, username taken.'));
          }
          else{
            var newUser = new User();
            newUser.user.username = username;
            newUser.user.password = newUser.generateHash(password); //this uses bcrypt to hash the password

            newUser.save(function(err){
              if(err){
                throw err;
              }
              return done(null, newUser);
            });
          }
        });
      });
    }
  ));

  passport.use('local-login', new LocalStrategy({ //this is the local signin strategy, it checks if the username exists in the database, and it checks if the password matches the username
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  },
    function(req, username, password, done){
      process.nextTick(function(){
        User.findOne({'user.username': username}, function(err, user){
          if(err){
            return done(err);
          }
          if(!user){
            return done(null, false, req.flash('loginMessage', 'Sorry, username does not exist.'));
          }
          if(!user.validatePassword(password)){ //this uses bcrypt the validate if the password is the same
            return done(null, false, req.flash('loginMessage', 'Sorry, the password does not match the username.'));
          }
          else{
            done(null, user);
          }
        });
      });
    }
  ));

  passport.use(new FacebookStrategy({ //this is the facebook strategy, once facebook send back the information, we check if this user exists in the database, if it doesn't, we will store this new information in the database
      clientID: appID,
      clientSecret: secret,
      callbackURL: url
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(function(){
          User.findOne({'facebookUser.id': profile.id}, function(err, user){
            if(err)
              return done(err);
            if(user)
              return done(null, user);
            else {
              var newUser = new User();
              newUser.facebookUser.id = profile.id;
              newUser.facebookUser.token = accessToken;
              newUser.facebookUser.username = profile.displayName;

              newUser.save(function(err){
                if(err){
                  throw err;
                }
                return done(null, newUser);
              });
            }
          });
        });
      }
  ));


}