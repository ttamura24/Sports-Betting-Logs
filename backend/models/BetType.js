import mongoose from 'mongoose';

const betTypeSchema = new mongoose.Schema({
  betType: {
    type: String,
    required: [true, 'Bet type name is required'],
  },
});

const BetType = mongoose.model('bet_type', betTypeSchema);

export default BetType; 