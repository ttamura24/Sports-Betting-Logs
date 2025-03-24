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
  teamID: {
    type: String,
    required: [true, 'Team ID is required'],
  },
  betTypeID: {
    type: String,
    required: [true, 'Bet type is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  datePlaced: {
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