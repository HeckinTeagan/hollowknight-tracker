// grub-tracker-server/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Grub = require('./models/Grub');

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

// Use a fixed ID for simplicity (this is the key to cross-browser persistence)
const TEST_USER_ID = 'test_knight_user'; 

// --- API Endpoints ---

// 1. GET: Load the checklist state from the database
app.get('/api/checklist', async (req, res) => {
    try {
        let checklist = await Grub.findOne({ userId: TEST_USER_ID });

        // If no data exists, return an empty object
        if (!checklist) {
            return res.json({});
        }
        res.json(checklist.checkedGrubs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching checklist.', error: error.message });
    }
});

// 2. POST: Update the checklist status in the database
app.post('/api/update', async (req, res) => {
    const { grubId, isChecked } = req.body;
    try {
        const updateKey = `checkedGrubs.${grubId}`;

        // Find and update the checklist document
        const updatedChecklist = await Grub.findOneAndUpdate(
            { userId: TEST_USER_ID },
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