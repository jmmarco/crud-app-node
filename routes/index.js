var express = require('express');
var router = express.Router();
// Remember to include user schema for Mongo
var User = require('../models/user');
// Add middleware
var mid = require('../middleware/');

// Setup routes

// GET routes
router.get('/', function(req, res, next) {
  return res.render('index', {title: 'Home'});
});

router.get('/register', mid.loggedOut, function(req, res, next) {
  return res.render('register', {title: 'Register'});
});

router.get('/profile', mid.requiresLogin, function(req, res, next) {
  User.findById(req.session.userId)
      .exec(function(error, user) {
        if (error) {
          return next(error);
        } else {
          return res.render("profile", {title: "Profile", name: user.name });
        }
      });
});

router.get('/login', function(req, res, next) {
  return res.render('login', {title: 'Log In'});
});

router.get('/about', function(req, res, next) {
  return res.render('about', { title: 'About' });
});


router.get('/logout', function(req, res, next) {
  if (req.session) {
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

// POST /register
router.post('/register', function(req, res, next) {
  if (req.body.email && req.body.name) {
    // Check password and confirm password fields
    if (req.body.password !== req.body.confirmPassword) {
      var err = new Error("Passwords don't match");
      err.status = 400;
      return next(err);
    }

    var userData = {
      email: req.body.email,
      name: req.body.name,
      password: req.body.password
    };

    // Add User schema create method here

    User.create(userData, function(error, user) {
      if (error) {
        return next(error);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });

  } else {
    var err = new Error("All fields required.");
    err.status = 400;
    return next(err);
  }
});

// POST /login
router.post('/login', mid.loggedOut, function(req, res, next) {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, function(error, user) {
      if (error || !user) {
        var err = new Error('Wrong email or password.');
        err.status = 401;
        return next(err);
      } else {
        req.session.userId = user._id;
        return res.redirect('/profile');
      }
    });

  } else {
    var err = new Error('Email and password required');
    err.status = 401;
    return next(err);
  }
});


module.exports = router;
