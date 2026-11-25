const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    minlength: [2, 'Name must be at least 2 characters'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Mobile number is required'],
    match: [/^\d{10}$/, 'Mobile number must be 10 digits']
  },
  password: { // Kept for backward compatibility, will migrate to passwordHash
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  passwordHash: { // New field
    type: String,
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false }
}, {
  timestamps: true
});

userSchema.index({ phone: 1 }, { sparse: true, unique: true });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password') && !this.isModified('passwordHash')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, salt);
    this.passwordHash = this.password; // keep in sync
  } else if (this.isModified('passwordHash')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    this.password = this.passwordHash; // keep in sync
  }
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  const hashToCompare = this.passwordHash || this.password;
  return await bcrypt.compare(enteredPassword, hashToCompare);
};

module.exports = mongoose.model('User', userSchema);
