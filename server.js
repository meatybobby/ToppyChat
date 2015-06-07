var express = require('express');
var app = express();
var mongoose = require('mongoose');
var passport = require('passport');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var flash    = require('connect-flash');
var MongoStore = require('connect-mongo')(session);

var configDB = require('./config/database.js');
var topic = require('./app/models/socket');
var port     = process.env.PORT || 8080;
var server = require('http').createServer(app);

mongoose.connect(configDB.url); // connect to our database
require('./config/passport')(passport); // pass passport for configuration
var mongoStore = new MongoStore({
    mongooseConnection: mongoose.connection
});
topic.open(server,mongoStore);
// set up our express application
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms
app.set('view engine', 'ejs'); // set up ejs for templating
app.use(express.static(__dirname + '/public'));  
app.use(session({ secret: 'ilovetoppychat' , store : mongoStore })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app,passport); // load our routes and pass in our app and fully configured passport

//app.listen(port);
server.listen(port);

console.log('The magic happens on port ' + port);