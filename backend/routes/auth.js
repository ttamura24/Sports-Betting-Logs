import express from 'express';
import User from '../models/User.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  try {

    const { username, password } = req.body;    
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    // ORM query to check if user exists
    const existingUser = await User.findOne({ username }).exec();
    if (existingUser) {
      return res.status(400).json({ 
        error: 'Username already exists' 
      });
    }

    // ORM query to create new user and save to database
    const user = new User({
      username,
      password 
    });
    await user.save();

    const userResponse = {
      id: user._id,
      username: user.username,
      accountCreationTime: user.accountCreationTime
    };
    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      error: error.message || 'Error creating user' 
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    // ORM query to find user by username
    const user = await User.findOne({ username }).exec();
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // compare password using the method we defined in the schema
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // set session data
    req.session.userId = user._id;
    req.session.username = user.username;

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Error during login' 
    });
  }
});

export default router; 