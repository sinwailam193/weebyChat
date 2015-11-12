var mongoose = require('mongoose');
var config = process.env.config || require('./config').mongo;
var bcrypt = require('bcrypt');

mongoose.connect(config);

var userSchema = new mongoose.Schema({
  user: {
    username: String,
    password: String
  },
  facebookUser: {
    id: String,
    token: String,
    username: String
  }
});

userSchema.methods.generateHash = function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
};

userSchema.methods.validatePassword = function(password){
  return bcrypt.compareSync(password, this.user.password);
};

exports.User = mongoose.model('User', userSchema);