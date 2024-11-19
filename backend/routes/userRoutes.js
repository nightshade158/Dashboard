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
            return res.status(400).json({ message: 'Username or email already exists ' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate authId using JWT
        const authId = jwt.sign({ username, email }, 'your_jwt_secret', { expiresIn: '1h' });

        // Create a new user
        const newUser   = new User({
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
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Generate a token (optional, can be used for further authentication)
        const token = jwt.sign({ id: user._id, isadmin: user.isadmin }, 'your_jwt_secret', { expiresIn: '1h' });

        // Return response based on user type
        res.status(200).json({
            message: 'Login successful',
            token: token, // Send the token back to the client
            isadmin: user.isadmin // Indicate if the user is an admin
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;