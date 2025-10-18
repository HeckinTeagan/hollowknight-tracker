// grub-tracker-server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// -----------------------------------------------------------------
// 🔑 ADDED: Import jsonwebtoken for creating and verifying tokens
// -----------------------------------------------------------------
const jwt = require('jsonwebtoken'); 
const Grub = require('./models/Grub');
const User = require('./models/User'); 


const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

// --- Middleware ---
// The * is necessary since your frontend is run locally via file://
app.use(cors({ origin: '*', methods: ['GET', 'POST'] })); 
app.use(express.json()); // To parse JSON bodies from the frontend

// --- Database Connection ---
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));

// -----------------------------------------------------------------
// ❌ DELETED: The fixed TEST_USER_ID is now obsolete
// -----------------------------------------------------------------
// const TEST_USER_ID = 'test_knight_user'; 

// -----------------------------------------------------------------
// 🔑 ADDED: JWT Middleware (The Security Guard)
// -----------------------------------------------------------------
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach the decoded userId to the request (this is how we know who the user is)
        req.userId = decoded.userId; 
        next(); // Token is valid, continue to the protected route handler

    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token. Please log in again.' });
    }
};

// -----------------------------------------------------------------
// 🔑 ADDED: AUTHENTICATION ROUTES (Signup and Login)
// -----------------------------------------------------------------

// POST /api/auth/signup: Handles new user registration
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (await User.findOne({ username })) {
            return res.status(400).json({ message: 'Username already taken.' });
        }

        const user = new User({ username, password });
        await user.save();
        
        // Generate JWT Token for immediate login
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.status(201).json({ token, message: 'User registered successfully.' });

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ message: 'Server error during signup.' });
    }
});


// POST /api/auth/login: Handles user login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        // Generate and send JWT Token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, message: 'Login successful.' });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});


// --- API Endpoints ---

// -----------------------------------------------------------------
// 🔄 MODIFIED: GET route now uses authMiddleware and req.userId
// -----------------------------------------------------------------
// 1. GET: Load the checklist state from the database
app.get('/api/checklist', authMiddleware, async (req, res) => { // 👈 ADD authMiddleware
    try {
        // Use the authenticated user's ID
        let checklist = await Grub.findOne({ userId: req.userId }); // 👈 USE req.userId

        // If no data exists, return an empty object
        if (!checklist) {
            return res.json({});
        }
        res.json(checklist.checkedGrubs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching checklist.', error: error.message });
    }
});

// -----------------------------------------------------------------
// 🔄 MODIFIED: POST route now uses authMiddleware and req.userId
// -----------------------------------------------------------------
// 2. POST: Update the checklist status in the database (renamed route)
// Note: Frontend must now POST to /api/checklist
app.post('/api/checklist', authMiddleware, async (req, res) => { // 👈 ADD authMiddleware and RENAME route
    const { grubId, isChecked } = req.body;
    try {
        const updateKey = `checkedGrubs.${grubId}`;

        // Find and update the checklist document by the authenticated user's ID
        const updatedChecklist = await Grub.findOneAndUpdate(
            { userId: req.userId }, // 👈 USE req.userId
            { $set: { [updateKey]: isChecked } }, // Set the specific grub's status
            { new: true, upsert: true } // Return new doc, create if needed
        );

        res.status(200).json({ success: true, status: updatedChecklist.checkedGrubs[grubId] });
    } catch (error) {
        res.status(500).json({ message: 'Error updating checklist.', error: error.message });
    }
});

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});