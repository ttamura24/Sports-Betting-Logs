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
  resultID: {
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

// Create indexes for different query patterns
// Single-field indexes for basic queries
betSchema.index({ userID: 1 }); // For basic user queries
betSchema.index({ datePlaced: 1 }); // For admin date range queries - keep as regular index for range queries
betSchema.index({ sportsbookID: "hashed" }); // For admin sportsbook queries
betSchema.index({ teamID: "hashed" }); // For admin team queries
betSchema.index({ betTypeID: "hashed" }); // For admin bet type queries
betSchema.index({ resultID: "hashed" }); // For admin result queries

// Compound indexes for user-specific filtered queries
betSchema.index({ userID: 1, datePlaced: 1 }); // For user-specific date range queries
betSchema.index({ userID: 1, sportsbookID: 1 }); // For user-specific sportsbook queries
betSchema.index({ userID: 1, teamID: 1 }); // For user-specific team queries
betSchema.index({ userID: 1, betTypeID: 1 }); // For user-specific bet type queries
betSchema.index({ userID: 1, resultID: 1 }); // For user-specific result queries

const Bets = mongoose.model('bets', betSchema);

export default Bets; 