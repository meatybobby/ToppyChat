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
	
	app.post('/profile', function(req,res) {
		if(req.isAuthenticated()) {
			User.findOne({ 'userid' :  req.user.userid }, function(err, user) {
				// if there are any errors, return the error before anything else
				if (err) {
					res.render('profile.ejs', {
						user : req.user, // get the user out of session and pass to template
						page_name: 'profile',
						message: 'Database Error'
					});
				}
			
				// if no user is found, return the message
				else if (!user) {
					res.render('profile.ejs', {
						user : req.user, // get the user out of session and pass to template
						page_name: 'profile',
						message: 'No user found.',
						success: false
					});
				}
			
				// if the user is found but the password is wrong
				else if (!user.validPassword(req.body.password)) {
					res.render('profile.ejs', {
						user : req.user, // get the user out of session and pass to template
						page_name: 'profile',
						message: 'Please enter your current password to change your profile.',
						success: false
					});
				}
			
				// all is well, return successful user
				else {
					var newUser = user;
					if(req.body.newpassword&&req.body.newpassword!="")
						newUser.password = newUser.generateHash(req.body.newpassword);
					newUser.nickname = req.body.nickname;
			
					// save the user
					newUser.save(function(err) {
						if (err)
							throw err;
						return res.render('profile.ejs',{
							user: newUser,
							page_name: 'profile',
							message: 'Your profile has been updated.',
							success: true
						});
					});
				}
			});
		}
		else
			res.redirect('/'); // load the index.ejs file
    });
	
	app.get('/friends', function(req, res){
		if(req.isAuthenticated()){
			res.render('friends.ejs', {
				user : req.user, // get the user out of session and pass to template
				page_name: 'friends'
			});
		}
		else
			res.redirect('/'); // load the index.ejs file
	});	
	app.delete('/friends/:friend_id',function(req,res) {
		if(req.isAuthenticated()) {
			var deleteUser=req.user.userid;
			deleteFriend(deleteUser,req.params.friend_id,res,1);
		}
		else res.redirect('/');
	});
	
	app.get('/friends-json',function(req,res) {
		if(req.isAuthenticated()) {
			var friendnick = {};
			var nick;
			var friends=req.user.friends;
			findNick(friends,friendnick,res);
		}
		else res.redirect('/');
	});
	
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

function deleteFriend(deleteid,friendid,res,st) {
	User.findOne({ 'userid' :  deleteid }, function(err, user) {
		// if there are any errors, return the error before anything else
		if (err) {
			return res.status(400).send('Fail');
		}
	
		// if no user is found, return the message
		else if (!user) {
			return res.status(400).send('Fail');
		}
	
		// all is well, return successful user
		else {
			var newUser = user;
			find=newUser.friends.indexOf(friendid);
			if(find!=-1) {
				newUser.friends.splice(find,1);
				// save the user
				newUser.save(function(err) {
					if (err)
						throw err;
					if(st) deleteFriend(friendid,deleteid,res,0);
					else {
						res.status(200).send('OK');
					}
				});
			}
		}
	});
}

function findNick(friends,fnick,res) {
	User.find({ 'userid' : { $in : friends } },{'userid':1,'nickname':1,'_id':0}, function(err, user) {
		// if there are any errors, return the error before anything else
		if (err) {
			res.status(400).send('Error');
			return;
		}
	
		// if no user is found, return the message
		else if (!user) {
			res.status(400).send('Error');
			return;
		}
		//console.log();
		res.status(200).send(user);
	});
}