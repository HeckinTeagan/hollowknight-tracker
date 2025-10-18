const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Required for password hashing

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true, // Ensures no two users have the same username
        trim: true,
        lowercase: true,
        minlength: 3
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    }
}, { timestamps: true });

// -----------------------------------------------------------------
// Mongoose Pre-Save Hook (Middleware)
// -----------------------------------------------------------------
// This function runs automatically BEFORE the user document is saved to MongoDB.

userSchema.pre('save', async function (next) {
    // Only run this function if password was actually modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate a salt (random string) to make hashing more secure
        const salt = await bcrypt.genSalt(10); 
        // Hash the plain-text password using the salt
        this.password = await bcrypt.hash(this.password, salt);
        next(); // Proceed with saving the document
    } catch (error) {
        next(error); // Pass error to Mongoose
    }
});

// -----------------------------------------------------------------
// Instance Method for Password Verification
// -----------------------------------------------------------------
// This method will be used during login to compare the entered password 
// with the hashed password stored in the database.

userSchema.methods.comparePassword = async function (candidatePassword) {
    // Compares the candidatePassword (plain text) with the stored hash (this.password)
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);