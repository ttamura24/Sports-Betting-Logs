import express from 'express';
import mongoose from 'mongoose';
import Bet from '../models/Bets.js';

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

/*
  get all sportsbooks, teams, bet types, and results
*/
router.get('/sportsbook', async (req, res) => {
  try {
    const sportsbooks = await mongoose.connection.db
      .collection('sportsbook')
      .find({})
      .toArray();
    res.json(sportsbooks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/teams', async (req, res) => {
  try {
    const teams = await mongoose.connection.db
      .collection('teams')
      .find({})
      .toArray();
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/bet-type', async (req, res) => {
  try {
    const betTypes = await mongoose.connection.db
      .collection('bet_type')
      .find({})
      .toArray();
    res.json(betTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/result', async (req, res) => {
  try {
    const result = await mongoose.connection.db
      .collection('result')
      .find({})
      .toArray();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// create a new bet
router.post('/add-bet', async (req, res) => {
  try {
    console.log('Received bet data:', req.body);

    const {
      userID,
      sportsbookID,
      teamID,
      betTypeID,
      description,
      datePlaced,
      odds,
      resultID,
      amountWagered,
      amountWon
    } = req.body;

    if (!userID || !sportsbookID || !teamID || !betTypeID || !description 
      || !datePlaced || !odds || !resultID || !amountWagered || !amountWon) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        receivedData: req.body 
      });
    }

    // ORM query to create new bet and save to database
    const newBet = new Bet({
      userID,
      sportsbookID,
      teamID,
      betTypeID,
      description,
      datePlaced,
      odds,
      resultID,
      amountWagered: Number(amountWagered),
      amountWon: Number(amountWon)
    });
    const savedBet = await newBet.save();

    res.status(201).json({ 
      message: 'Bet created successfully',
      bet: savedBet 
    });
  } catch (error) {
    console.error('Error creating bet:', error);
    res.status(500).json({ 
      message: 'Failed to create bet',
      error: error.message 
    });
  }
});

// get a single bet by ID
router.get('/bets/single/:betId', async (req, res) => {
  try {
    // ORM query to get a single bet by ID
    const bet = await Bet.findById(req.params.betId);
    if (!bet) {
      return res.status(404).json({ message: 'Bet not found' });
    }
    res.json(bet);
  } catch (error) {
    console.error('Error fetching single bet:', error);
    res.status(500).json({ message: 'Failed to fetch bet', error: error.message });
  }
});

// update a bet
router.put('/bets/:betId', async (req, res) => {
  try {
    const {
      userID,
      sportsbookID,
      teamID,
      betTypeID,
      description,
      datePlaced,
      odds,
      resultID,
      amountWagered,
      amountWon
    } = req.body;

    if (!userID || !sportsbookID || !teamID || !betTypeID || !description 
      || !datePlaced || !odds || !resultID || !amountWagered || !amountWon) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        receivedData: req.body 
      });
    }

    // ORM query to find and update the bet
    const updatedBet = await Bet.findByIdAndUpdate(
      req.params.betId,
      {
        userID,
        sportsbookID,
        teamID,
        betTypeID,
        description,
        datePlaced,
        odds,
        resultID,
        amountWagered: Number(amountWagered),
        amountWon: Number(amountWon)
      },
      { new: true, runValidators: true } // Return updated doc and run schema validations
    );

    if (!updatedBet) {
      return res.status(404).json({ message: 'Bet not found' });
    }

    res.json({
      message: 'Bet updated successfully',
      bet: updatedBet
    });

  } catch (error) {
    console.error('Error updating bet:', error);
    res.status(500).json({ 
      message: 'Failed to update bet',
      error: error.message 
    });
  }
});

// delete a bet
router.delete('/bets/:betId', async (req, res) => {
  try {
    // ORM query to delete a bet
    const deletedBet = await Bet.findByIdAndDelete(req.params.betId);
    
    if (!deletedBet) {
      return res.status(404).json({ message: 'Bet not found' });
    }

    res.json({
      message: 'Bet deleted successfully',
      bet: deletedBet
    });
  } catch (error) {
    console.error('Error deleting bet:', error);
    res.status(500).json({ 
      message: 'Failed to delete bet',
      error: error.message 
    });
  }
});

// get all bets for a specific user ... prepare statement / ORM
router.get('/bets/:userId', async (req, res) => {
  try {
    // validate userID format 
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const userId = req.params.userId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const sportsbook = req.query.sportsbook;
    const team = req.query.team;
    const betType = req.query.betType;
    const result = req.query.result;
    console.log('Query params:', { userId, startDate, endDate, sportsbook, team, betType, result });

    // Build match stage properly
    const matchStage = {
      userID: userId
    };

    // Add date filter to match stage if dates are provided
    if (startDate && endDate) {
      matchStage.datePlaced = {
        $gte: new Date(startDate),
        $lte: new Date(endDate).setHours(23, 59, 59)
      };
    }

    // Add sportsbook filter to match stage if sportsbook is provided
    if (sportsbook) {
      // Look up sportsbook ID by name
      const sportsbookDoc = await mongoose.connection.db
        .collection('sportsbook')
        .findOne({ name: sportsbook });
      
      if (sportsbookDoc) {
        matchStage.sportsbookID = sportsbookDoc._id.toString();
      }
    }

    // Add team filter to match stage if team is provided
    if (team) {
      // Look up team ID by name
      const teamDoc = await mongoose.connection.db
        .collection('teams')
        .findOne({ name: team });
      
      if (teamDoc) {
        matchStage.teamID = teamDoc._id.toString();
      }
    }

    // Add bet type filter to match stage if bet type is provided
    if (betType) {
      // Look up bet type ID by name
      const betTypeDoc = await mongoose.connection.db
        .collection('bet_type')
        .findOne({ betType: betType });
      
      if (betTypeDoc) {
        matchStage.betTypeID = betTypeDoc._id.toString();
      }
    }

    // Add result filter to match stage if result is provided
    if (result) {
      // Look up result ID by name
      const resultDoc = await mongoose.connection.db
        .collection('result')
        .findOne({ result: result });
      
      if (resultDoc) {
        matchStage.resultID = resultDoc._id.toString();
      }
    }

    // use toString to match types and sanitize input
    const bets = await Bet.aggregate([
      {
        $match: matchStage
      },
      {
        $lookup: {
          from: 'sportsbook',
          let: { sportsbookId: { $toString: '$sportsbookID' } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: '$_id' }, '$$sportsbookId']
                }
              }
            }
          ],
          as: 'sportsbook'
        }
      },
      {
        $lookup: {
          from: 'teams',
          let: { teamId: { $toString: '$teamID' } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: '$_id' }, '$$teamId']
                } 
              }
            }
          ],
          as: 'team'
        }
      },
      {
        $lookup: {
          from: 'bet_type',
          let: { betTypeId: { $toString: '$betTypeID' } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: '$_id' }, '$$betTypeId']
                }
              }
            }
          ],
          as: 'betType'
        }
      },
      {
        $lookup: {
          from: 'result',
          let: { resultId: { $toString: '$resultID' } },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: '$_id' }, '$$resultId']
                } 
              }
            }
          ],
          as: 'result'
        }
      },
      {
        $project: {
          id: '$_id',
          sportsbookName: { $arrayElemAt: ['$sportsbook.name', 0] },
          teamName: { $arrayElemAt: ['$team.name', 0] },
          betType: { $arrayElemAt: ['$betType.betType', 0] },
          amountWagered: 1,
          amountWon: 1,
          result: { $arrayElemAt: ['$result.result', 0] },
          datePlaced: 1,
          description: 1,
          odds: 1
        }
      }
    ]);
    res.json(bets);
  } catch (error) {
    console.error('Error fetching bets:', error);
    res.status(500).json({ message: 'Failed to fetch bets', error: error.message });
  }
});

export default router;
