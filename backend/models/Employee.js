const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    position: { type: String, required: true },
    password: { type: String, required: true },
    profilePic: { type: String }, // URL for profile picture
    employeeType: { type: String, required: true }, // e.g., 'Full-Time', 'Part-Time'
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Employee', employeeSchema);
