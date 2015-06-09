var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var messageSchema = mongoose.Schema({

	sendid : String,
	receiveid : String,
	message : String,
	time : Number,
	read : Boolean,

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Message', messageSchema);