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

// get all bets for a specific user
router.get('/bets/:userId', async (req, res) => {
  try {
    const bets = await Bet.aggregate([
      {
        $match: { userID: req.params.userId }
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

export default router;
