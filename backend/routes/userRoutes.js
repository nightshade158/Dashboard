const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

router.post('/signup', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const authId = jwt.sign({ username, email }, 'your_jwt_secret', { expiresIn: '1h' });

        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            authId
        });

        await newUser.save();
        res.status(201).json({ message: 'User  created successfully', authId });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id, isadmin: user.isadmin }, 'your_jwt_secret', { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful',
            token: token,
            isadmin: user.isadmin,
            ismiddle: user.ismiddle
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/addmiddleman', async (req, res) => {
    const { username, email, password, features } = req.body;

    console.log('Received request body:', req.body);

    if (!username || !email || !password || !Array.isArray(features)) {
        return res.status(400).json({ message: 'Please provide all required fields and ensure features is an array.' });
    }

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'Username or email already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const authId = jwt.sign({ username, email, timestamp: Date.now() }, 'your_jwt_secret', { expiresIn: '1h' });

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            authId,
            ismiddle: true,
            features,
        });

        await newUser.save();
        res.status(201).json({ message: 'Middleman added successfully' });
    } catch (error) {
        console.error('Error adding middleman:', error);

        console.error('Error details:', JSON.stringify(error, null, 2));

        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }

        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.` });
        }

        res.status(500).json({ message: 'Failed to add middleman', error: error.message });
    }
});

router.get('/middlemanfeatures', async (req, res) => {
    const username = req.query.username;
    try {
        console.log('Fetching features for username:', username);

        const user = await User.findOne({ username: username });

        console.log('User  found:', user);

        if (!user) {
            return res.status(404).json({ message: 'User  not found' });
        }

        if (!user.ismiddle) {
            return res.status(403).json({ message: 'User  is not a middleman' });
        }

        res.json({ features: user.features });
    } catch (error) {
        console.error('Error fetching middleman features:', error);
        res.status(500).json({ message: 'Failed to fetch features' });
    }
});

router.get('/middlemen', async (req, res) => {
    try {
      const middlemen = await User.find({ ismiddle: true }); // Filter users by isAdmin field
      res.status(200).json(middlemen);
    } catch (error) {
      console.error('Error fetching middlemen:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.post('/editmiddlefeatures', async (req, res) => {
    const { username, features } = req.body;
  
    try {
      const updatedMiddleman = await User.findOneAndUpdate(
        { username },
        { features },
        { new: true } // Return the updated document
      );
  
      if (!updatedMiddleman) {
        return res.status(404).json({ message: 'Middleman not found' });
      }
  
      res.status(200).json({ message: 'Middleman features updated successfully', updatedMiddleman });
    } catch (error) {
      console.error('Error updating middleman features:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
module.exports = router;