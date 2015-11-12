var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;

var User = require('./mongo').User;
var appID = process.env.appID || require('./config').appID;
var secret = process.env.secret || require('./config').secret;
var url = process.env.url || require('./config').url;

module.exports = function(passport){

  passport.serializeUser(function(user, done){
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done){
    User.findById(id, function(err, user){
      done(err, user);
    });
  });

  passport.use('local-signup', new LocalStrategy({
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
          if(user){
            return done(null, false, req.flash('signupMessage', 'That username is already taken!'));
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

  passport.use('local-login', new LocalStrategy({
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
            return done(null, false, req.flash('loginMessage', 'That username does not exist!'));
          }
          if(!user.validatePassword(password)){ //this uses bcrypt the validate if the password is the same
            return done(null, false, req.flash('loginMessage', 'That password does not match!'));
          }
          else{
            done(null, user);
          }
        });
      });
    }
  ));

  passport.use(new FacebookStrategy({
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
              newUser.facebookUser.name = profile.displayName;

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