var mongoose = require('mongoose'); //requiring mongoos, the orm for mongoDB
var config = process.env.config || require('./config').mongo; //this will require the mongodb connection for mongoose, in heroku, it will use the one in its config file
var bcrypt = require('bcrypt'); //requiring bcrypt to hash the password and store it in the database

mongoose.connect(config);

var userSchema = new mongoose.Schema({ //depending on how the user login and singup, we store the information into the database with these two schemas
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

userSchema.methods.generateHash = function(password){ //this hashes the password with salt
  return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
};

userSchema.methods.validatePassword = function(password){ //this will check if the unhash password is the same as the password the user provided
  return bcrypt.compareSync(password, this.user.password);
};

exports.User = mongoose.model('User', userSchema);