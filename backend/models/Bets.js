import mongoose from 'mongoose';

const betSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: [true, 'User ID is required'],
  },
  sportsbookID: {
    type: String,
    required: [true, 'Sportsbook ID is required'],
  },
  betType: {
    type: String,
    required: [true, 'Bet type is required'],
  },
  betList: {
    type: Array,
    required: [true, 'Bet list is required'],
  },
  timeBetPlaced: {
    type: Date,
    default: Date.now
  },
  odds: {
    type: String,
    required: [true, 'Odds are required'],
  },
  result: {
    type: String,
    required: [true, 'Result is required'],
  },
  amountWagered: {
    type: String,
    required: [true, 'Amount wagered is required'],
  },    
  amountWon: {
    type: String,
    required: [true, 'Amount won is required'],
  },
});

const Bets = mongoose.model('bets', betSchema);

export default Bets; 