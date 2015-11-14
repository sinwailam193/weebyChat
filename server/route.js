var User = require('./mongo').User //this files has the schema for storing users into the mongo database and we will require it

function isLoggedIn(req, res, next){ //created a custom middleware that will check if the user is currently logged in
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
};

module.exports = function(app, passport){

  app.get('/', function(req, res){ //this renders the index page the first time the users head to the page
    res.render('index');
  });

  app.get('/signup', function(req, res){ //this will check if users are logged in, if they are they will be redirected back to the /chat get request
    if(req.user){
      res.redirect('/chat');
    }
    else{
      res.render('signup', {message: req.flash('signupMessage')}); //if there is an error req.flash will contain a value that matches with the "signupMessage" key
    }
  });

  app.get('/login', function(req, res){
    if(req.user){
      res.redirect('/chat');
    }
    else{
      res.render('login', {message: req.flash('loginMessage')}); //if there is an error req.flash will contain a value that matches with the "loginMessage" key
    }
  });

  app.get('/logout', function(req, res){
    req.logout(); //a passport function that is added to express, that destroys the req.user
    res.redirect('/');//this will send user back to homepage
  })

  app.get('/chat', isLoggedIn, function(req, res){
    res.render('chat'); //if user is logged in inside the session, they will be redirected back to this page
  });

  app.get('/auth/facebook', passport.authenticate('facebook')); //this uses the facebook passport strategy to authenticate the user if user chooses facebook to log in

  app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), function(req, res) { //once facebook has the information it will send back to /auth/facebook/callback 
    // Successful authentication, redirect chat page.
    res.redirect('/chat');
  });

  app.get('/userInfo', function(req, res){ //client side will request for the user's info in the session and we will send back to the username of the user
    if(req.user){
      var user = req.user.facebookUser.username || req.user.user.username;
      res.json(user);
    }
  })

  app.post('/signup', passport.authenticate('local-signup', { //this uses signup strategy from passport to check if the username existed already
    successRedirect: '/chat',
    failureRedirect: '/signup',
    failureFlash: true //this will go ahead and send the req.flash message to page
  }));

  app.post('/login', passport.authenticate('local-login', { //this uses login strategy from passport to check if the username exist in database and also if the password matches
    successRedirect: '/chat',
    failureRedirect: '/login',
    failureFlash: true
  }));
};