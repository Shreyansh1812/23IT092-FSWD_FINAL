const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const path = require('path');
const employeeRoutes = require('./routes/employeeRoutes');

dotenv.config();
const app = express();

// Middleware
app.use(cors({ 
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], 
    credentials: true 
}));
app.use(express.json());

// Middleware for authentication
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                console.error('Token verification error:', err); // Log token verification errors
                const message = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
                return res.status(403).json({ message });
            }
            req.user = decoded;
            next();
        });
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({ message: 'Server error during authentication' });
    }
};

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/employees', (req, res, next) => {
    if (['/login', '/refresh', '/register'].includes(req.path)) {
        return next(); // Skip authentication for these routes
    }
    authenticate(req, res, next);
}, employeeRoutes);

// Error handling middleware
app.use((req, res) => {
    res.status(404).json({ message: 'Resource not found' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Server error', error: err.message });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
