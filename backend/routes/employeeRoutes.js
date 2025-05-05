const express = require('express');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Employee = require('../models/Employee');
const cookieParser = require('cookie-parser');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });
router.use(cookieParser());

// List all employees
router.get('/', async (req, res) => {
    const employees = await Employee.find();
    res.json(employees);
});

// Add new employee with profile picture
router.post('/', upload.single('profilePic'), async (req, res) => {
    const { name, email, position, employeeType } = req.body;
    const profilePic = req.file ? `/uploads/${req.file.filename}` : null;

    // Validate input
    if (!name || !email || !position || !employeeType) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    const newEmployee = new Employee({ name, email, position, employeeType, profilePic });
    await newEmployee.save();
    res.status(201).json(newEmployee);
});

// Edit employee with profile picture
router.put('/:id', upload.single('profilePic'), async (req, res) => {
    const { name, email, position, employeeType } = req.body;
    const profilePic = req.file ? `/uploads/${req.file.filename}` : undefined;

    // Validate input
    if (!name || !email || !position || !employeeType) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    const updatedData = { name, email, position, employeeType };
    if (profilePic) updatedData.profilePic = profilePic;

    const updatedEmployee = await Employee.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.json(updatedEmployee);
});

// Delete employee
router.delete('/:id', async (req, res) => {
    await Employee.findByIdAndDelete(req.params.id);
    res.status(204).send();
});

// Search employee
router.get('/search', async (req, res) => {
    const { query } = req.query;
    const employees = await Employee.find({ name: new RegExp(query, 'i') });
    res.json(employees);
});

// Get employee details by ID
router.get('/:id', async (req, res) => {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
});

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await Employee.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ id: user._id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
    const refreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '1d' });

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        sameSite: 'None',
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken });
});

// Refresh token route
router.post('/refresh', (req, res) => {
    const refreshToken = req.cookies?.jwt;
    if (!refreshToken) return res.status(406).json({ message: 'Unauthorized' });

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
        if (err) return res.status(406).json({ message: 'Unauthorized' });

        const accessToken = jwt.sign({ id: decoded.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10m' });
        res.json({ accessToken });
    });
});

// Register route
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }
    
    try {
        // Check if email already exists
        const existingUser = await Employee.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already in use' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        const newEmployee = new Employee({ 
            name, 
            email, 
            position: 'Employee', 
            password: hashedPassword 
        });
        
        await newEmployee.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(400).json({ message: 'Error registering user', error: err.message });
    }
});

module.exports = router;
