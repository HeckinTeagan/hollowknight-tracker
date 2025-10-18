// grub-tracker-server/models/Grub.js
const mongoose = require('mongoose');

const GrubSchema = new mongoose.Schema({
    // Fixed ID for simplicity (avoids needing a full login system)
    userId: { type: String, required: true, unique: true }, 

    // Map to store which grubs are checked (e.g., {"grub-1": true, "grub-2": false})
    checkedGrubs: { 
        type: Map, 
        of: Boolean 
    }
});

module.exports = mongoose.model('Grub', GrubSchema);