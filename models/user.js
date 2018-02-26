var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var UserSchema   = new Schema({
        "firstName": { "type": String, "required": true },
        "lastName": { "type": String },
        "gender": { "type": String },
        "email": { "type": String, "required": true },
        "createdOn": { "type": Date, "default": Date.now }
    },
	{"collection": 'users'});

module.exports = mongoose.model('user', UserSchema);
