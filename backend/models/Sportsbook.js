import mongoose from 'mongoose';

const sportsbookSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sportsbook name is required'],
  },
});

const Sportsbook = mongoose.model('sportsbook', sportsbookSchema);

export default Sportsbook; 