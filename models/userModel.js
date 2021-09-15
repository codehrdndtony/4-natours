const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide an user name!']
  },
  email: {
    type: String,
    required: [true, 'Please provide user email!'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  photo: String,
  password: {
    type: String,
    required: [true, 'Password can not be empty'],
    minlength: 8
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Password must be confirmed']
  }
});

const User = mongoose.model( 'User', userSchema);

module.exports = User;
