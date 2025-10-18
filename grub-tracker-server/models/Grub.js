const mongoose = require('mongoose');

const grubSchema = new mongoose.Schema({
    // NEW FIELD: This is the user's ID (from the User model)
    userId: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the new User model
        required: true,
        unique: true // Ensures only one checklist document per user
    },
    
    // This is the field that holds your grub status (was called checkedGrubs in your server.js)
    checkedGrubs: {
        type: Map,          
        of: Boolean,        
        default: {}
    }
}, { timestamps: true });

// Note: We keep the name 'Grub' here to match the import in server.js
module.exports = mongoose.model('Grub', grubSchema);