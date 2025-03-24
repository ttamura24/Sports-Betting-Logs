import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  accountCreationTime: {
    type: Date,
    default: Date.now
  }
});

userSchema.methods.comparePassword = function(candidatePassword) {
  return this.password === candidatePassword;
};

const User = mongoose.model('users', userSchema);

export default User; 