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
      .project({ name: 1 })
      .sort({ name: 1 })
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
      .project({ name: 1 })
      .sort({ name: 1 })
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
      .project({ betType: 1 })
      .sort({ betType: 1 })
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
      .project({ result: 1 })
      .sort({ result: 1 })
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
        userID: req.params.userId,
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

// get all bets for a specific user (or all bets if admin) ... prepare statement / ORM
router.get('/bets/:userId', async (req, res) => {
  try {
    // validate userID format 
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const userId = req.params.userId;
    const { startDate, endDate, sportsbook, team, betType, result } = req.query;

    // Check if the requesting user is an admin
    const requestingUser = await mongoose.connection.db
      .collection('users')
      .findOne({ _id: new mongoose.Types.ObjectId(userId) });

    // Build initial match stage using the compound index
    const matchStage = {};
    
    // If not admin, only show their own bets
    if (!requestingUser || !requestingUser.isAdmin) {
      matchStage.userID = userId;
    }

    // Date range uses the compound index (userID_1_datePlaced_1)
    if (startDate && endDate) {
      matchStage.datePlaced = {
        $gte: new Date(startDate),
        $lte: new Date(endDate).setHours(23, 59, 59)
      };
    }

    if (sportsbook) matchStage.sportsbookID = sportsbook;
    if (team) matchStage.teamID = team;
    if (betType) matchStage.betTypeID = betType;
    if (result) matchStage.resultID = result;

    console.log('Query filters:', matchStage);

    const pipeline = [
      { $match: matchStage },
      // Join with sportsbook collection
      {
        $lookup: {
          from: 'sportsbook',
          let: { sportsbookId: '$sportsbookID' },
          pipeline: [
            {
              $match: {
                $expr: { 
                  $eq: ['$_id', { $toObjectId: '$$sportsbookId' }]
                }
              }
            }
          ],
          as: 'sportsbook'
        }
      },
      // Join with teams collection
      {
        $lookup: {
          from: 'teams',
          let: { teamId: '$teamID' },
          pipeline: [
            {
              $match: {
                $expr: { 
                  $eq: ['$_id', { $toObjectId: '$$teamId' }]
                }
              }
            }
          ],
          as: 'team'
        }
      },
      // Join with bet_type collection
      {
        $lookup: {
          from: 'bet_type',
          let: { betTypeId: '$betTypeID' },
          pipeline: [
            {
              $match: {
                $expr: { 
                  $eq: ['$_id', { $toObjectId: '$$betTypeId' }]
                }
              }
            }
          ],
          as: 'betType'
        }
      },
      // Join with result collection
      {
        $lookup: {
          from: 'result',
          let: { resultId: '$resultID' },
          pipeline: [
            {
              $match: {
                $expr: { 
                  $eq: ['$_id', { $toObjectId: '$$resultId' }]
                }
              }
            }
          ],
          as: 'result'
        }
      },
      // Join with users collection to get username
      {
        $lookup: {
          from: 'users',
          let: { userId: '$userID' },
          pipeline: [
            {
              $match: {
                $expr: { 
                  $eq: ['$_id', { $toObjectId: '$$userId' }]
                }
              }
            }
          ],
          as: 'user'
        }
      },
      // Project the fields we want
      {
        $project: {
          _id: 1,
          id: '$_id',
          sportsbookID: 1,
          teamID: 1,
          betTypeID: 1,
          resultID: 1,
          amountWagered: 1,
          amountWon: 1,
          datePlaced: 1,
          description: 1,
          odds: 1,
          userID: 1,
          sportsbookName: { $arrayElemAt: ['$sportsbook.name', 0] },
          teamName: { $arrayElemAt: ['$team.name', 0] },
          betType: { $arrayElemAt: ['$betType.betType', 0] },
          result: { $arrayElemAt: ['$result.result', 0] },
          username: { $arrayElemAt: ['$user.username', 0] }
        }
      }
    ];

    const bets = await Bet.aggregate(pipeline);
    console.log('Found bets:', bets.length);

    res.json(bets);
  } catch (error) {
    console.error('Error fetching bets:', error);
    res.status(500).json({ message: 'Failed to fetch bets', error: error.message });
  }
});

export default router;
