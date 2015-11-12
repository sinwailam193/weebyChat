var User = require('./mongo').User

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
};

module.exports = function(app, passport){

  app.get('/', function(req, res){
    res.render('index');
  });

  app.get('/signup', function(req, res){
    if(req.user){
      res.redirect('/chat');
    }
    else{
      res.render('signup', {message: req.flash('signupMessage')});
    }
  });

  app.get('/login', function(req, res){
    if(req.user){
      res.redirect('/chat');
    }
    else{
      res.render('login', {message: req.flash('loginMessage')});
    }
  });

  app.get('/logout', function(req, res){
    req.logout(); //a passport function that is added to express, that destroys the req.user
    res.redirect('/');
  })

  app.get('/chat', isLoggedIn, function(req, res){
    res.render('chat', {user: req.user}); //req.user is populated when we went through passport js to authenticate users
  });

  app.get('/auth/facebook', passport.authenticate('facebook')); 

  app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), function(req, res) {
    // Successful authentication, redirect chat page.
    res.redirect('/chat');
  });

  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/chat',
    failureRedirect: '/signup',
    failureFlash: true //gonna go ahead and send the req.flash to page
  }));

  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/chat',
    failureRedirect: '/login',
    failureFlash: true
  }));


};