// app/routes.js
var User  = require('./models/user');
module.exports = function(app, passport) {

    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        if(req.isAuthenticated()){
			res.render('topic.ejs', {
				user : req.user, // get the user out of session and pass to template
				page_name: 'topic'
			});
		}
		else
			res.render('index.ejs'); // load the index.ejs file
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {
		if(req.isAuthenticated()){
			res.redirect('/');
		} else
        // render the page and pass in any flash data if it exists
        res.render('login.ejs', { message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {
		if(req.isAuthenticated()){
			res.redirect('/');
		} else
        // render the page and pass in any flash data if it exists
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // PROFILE SECTION =====================
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
	
	app.get('/users', function(req, res){
		User.find(function (err, users) {
		  if (err) return console.error(err);
		  res.json(users);
		})
	});
	
	app.get('/profile', function(req, res){
		if(req.isAuthenticated()){
			res.render('profile.ejs', {
				user : req.user, // get the user out of session and pass to template
				page_name: 'profile',
				message: req.flash('updateMessage')
			});
		}
		else
			res.redirect('/'); // load the index.ejs file
	});
	
	app.post('/profile', passport.authenticate('local-update', {
        successRedirect : '/', // redirect to the secure profile section
        failureRedirect : '/profile', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
	
	app.use("*",function(req,res){
		res.status(404).send('404 Page not found!');
	});
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}