const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, default: 'Anonymous', trim: true, maxlength: 80 },
  photo: { type: String, default: '', maxlength: 500 },
  provider: { type: String, default: 'password' },
  lastLoginAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
