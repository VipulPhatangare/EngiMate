const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  surname: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    default: null
  },
  otpExpires: {
    type: Date,
    default: null
  },
  // Academic Information
  mhtCetPercentile: {
    type: Number,
    min: 0,
    max: 100
  },
  jeePercentile: {
    type: Number,
    min: 0,
    max: 100
  },
  generalRank: {
    type: Number,
    min: 0
  },
  allIndiaRank: {
    type: Number,
    min: 0
  },
  caste: {
    type: String,
    enum: ['General', 'OBC', 'SC', 'ST', 'EWS', ''],
    default: ''
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', ''],
    default: ''
  },
  board: {
    type: String,
    enum: ['HSC', 'CBSE', 'ICSE', 'IB', 'Other', ''],
    default: ''
  },
  twelfthPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  physicsMarks: {
    type: Number,
    min: 0,
    max: 100
  },
  chemistryMarks: {
    type: Number,
    min: 0,
    max: 100
  },
  mathematicsMarks: {
    type: Number,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('User', userSchema)
