const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  salutation: {
    type: String,
    enum: ["Mr", "Ms", "Mrs", "Dr", "Prof"],
    required: true,
  },
  firstName: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 50,
  },
  isdCode: {
    type: String,
    required: true,
    match: /^\+\d{1,3}$/,
  },
  mobile: {
  type: String,
  required: true,
  unique: true,
  match: /^[1-9]\d{5,11}$/,  // Starts with 1-9, followed by 5 to 11 digits (total 6 to 12 digits)
},
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\S+@\S+\.\S+$/,
  },
  otp: {
    type: String,
  },
  otpExpire: {
    type: Date,
  },
  otpRequests: {
    type: Number,
    default: 0,
  },
  lastOtpRequest: {
    type: Date,
  },

  invalidOtpAttempts: {
    type: Number,
    default: 0,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
