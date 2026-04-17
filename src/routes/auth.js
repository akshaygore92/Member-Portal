const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Mock user database 
const users = [];

// JWT secret key
const JWT_SECRET = 'your_jwt_secret_key'; // Replace with an environment variable in production

// Middleware for token verification
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Ideally, you would check username & password from your DB
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(400).send('Invalid credentials');

    const token = jwt.sign({ username: user.username }, JWT_SECRET);
    res.json({ token });
});

// POST /api/auth/signup
router.post('/signup', (req, res) => {
    const { username, password } = req.body;
    if (users.find(u => u.username === username)) return res.status(400).send('User already exists');
    users.push({ username, password });
    res.status(201).send('User created');
});

// POST /api/auth/mfa
router.post('/mfa', authenticateToken, (req, res) => {
    const { mfaCode } = req.body;
    // Here you should validate the MFA code; this is just a placeholder
    if (mfaCode !== '123456') return res.status(400).send('Invalid MFA code');
    res.send('MFA validation successful');
});

module.exports = router;