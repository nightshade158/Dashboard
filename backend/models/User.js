const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  authId: {
    type: String,
    required: false,
    unique: true
  },
  isadmin: {
    type: Boolean,
    default: false
  },
  ismiddle: {
    type: Boolean,
    default: false // New field to indicate if the user is a middleman
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  features: {
    type: [String], // Array to store features assigned to the middleman
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;