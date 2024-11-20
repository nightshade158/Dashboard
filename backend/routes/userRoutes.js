const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Adjust the path as necessary
const router = express.Router();

// Signup Route
router.post('/signup', async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // Check if user already exists
        const existingUser  = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser ) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate authId using JWT
        const authId = jwt.sign({ username, email }, 'your_jwt_secret', { expiresIn: '1h' });

        // Create a new user
        const newUser  = new User({
            username,
            password: hashedPassword,
            email,
            authId // Use the generated authId
        });

        // Save the user to the database
        await newUser .save();
        res.status(201).json({ message: 'User  created successfully', authId }); // Include authId in response
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid username' });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        // Generate a token (optional, can be used for further authentication)
        const token = jwt.sign({ id: user._id, isadmin: user.isadmin }, 'your_jwt_secret', { expiresIn: '1h' });

        // Return response based on user type
        res.status(200).json({
            message: 'Login successful',
            token: token, // Send the token back to the client
            isadmin: user.isadmin, // Indicate if the user is an admin
            ismiddle: user.ismiddle // Indicate if the user is a middle
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/addmiddleman', async (req, res) => {
    const { username, email, password, features } = req.body;

    // Log the incoming request body
    console.log('Received request body:', req.body);

    // Basic validation
    if (!username || !email || !password || !Array.isArray(features)) {
        return res.status(400).json({ message: 'Please provide all required fields and ensure features is an array.' });
    }

    try {
        // Check if the user already exists
        const existingUser   = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser ) {
            return res.status(400).json({ message: 'Username or email already exists.' });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

        // Generate a unique authId
        const authId = jwt.sign({ username, email, timestamp: Date.now() }, 'your_jwt_secret', { expiresIn: '1h' });

        const newUser  = new User({
            username,
            email,
            password: hashedPassword, // Use the hashed password
            authId, // Use the generated authId
            ismiddle: true, // Set ismiddle to true for middleman
            features, // Use the features array directly from the request body
        });

        // Save the user to the database
        await newUser .save();
        res.status(201).json({ message: 'Middleman added successfully' });
    } catch (error) {
        console.error('Error adding middleman:', error);

        // Log the entire error object for debugging
        console.error('Error details:', JSON.stringify(error, null, 2)); // Log the error in a readable format

        // Check if the error is a validation error from Mongoose
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }

        // Handle duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0]; // Get the field that caused the duplicate key error
            return res.status(400).json({ message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.` });
        }

        // Handle other errors
        res.status(500).json({ message: 'Failed to add middleman', error: error.message });
    }
});
  
  // Get Middleman Features
router.get('/middlemanfeatures', async (req, res) => {
  const username = req.query.username; // Get the username from the query parameters
  try {
    // Log the username for debugging
    console.log('Fetching features for username:', username);
    
    const user = await User.findOne({ username: username }); // Find user by username
    
    // Log the user object for debugging
    console.log('User  found:', user);
  
    if (!user) {
      return res.status(404).json({ message: 'User  not found' });
    }
  
    if (!user.ismiddle) {
      return res.status(403).json({ message: 'User  is not a middleman' });
    }
  
    // Return the features
    res.json({ features: user.features });
  } catch (error) {
    console.error('Error fetching middleman features:', error);
    res.status(500).json({ message: 'Failed to fetch features' });
  }
});

// Export the router
module.exports = router;