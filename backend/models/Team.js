import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Team name is required'],
  },
});

const Team = mongoose.model('team', teamSchema);

export default Team; 