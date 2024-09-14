const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'educator'], required: true },
  school: { type: String, required: function() { return this.role === 'educator'; } },
  teacherId: { type: String, unique: true, sparse: true, required: function() { return this.role === 'educator'; } },
  rollNo: { type: String, required: function() { return this.role === 'student'; } },
  class: { 
    type: Number, 
    required: function() { return this.role === 'student'; },
    min: 4,
    max: 12
  },
  section: { 
    type: String, 
    required: function() { return this.role === 'student'; },
    enum: ['A', 'B', 'C', 'D']
  }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;