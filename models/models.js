var mongoose = require('mongoose');

var bookSchema = new mongoose.Schema({
	name: String,
	url_img: String,
	created_by: String,
	request: {
		user: String,
		accepted: {type: Boolean, default: false}
	},
	created_at: {type: Date, default: Date.now}
});

var userSchema = new mongoose.Schema({
	username: String,
	password: String,
	name: {type: String, default: ''},
	city: {type: String, default: ''},
	state: {type: String, default: ''},
	created_at: {type: Date, default: Date.now}
})

mongoose.model('Book', bookSchema);
mongoose.model('User', userSchema);

//utility functions
var User = mongoose.model('User');
exports.findByUsername = function(username, callback){
	User.findOne({ user_name: username}, function(err, user){
		if(err){
			return callback(err);
		}
		//success
		return callback(null, user);
	});
}

exports.findById = function(id, callback){
	User.findById(id, function(err, user){
		if(err){
			return callback(err);
		}
		return callback(null, user);
	});
}