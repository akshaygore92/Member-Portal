const express = require('express');
const router = express.Router();

// Sample data for benefits
const benefits = [
    { id: 1, name: 'Health Insurance', description: 'Coverage for medical expenses.' },
    { id: 2, name: 'Dental Insurance', description: 'Coverage for dental procedures.' }
];

// GET /api/benefits - Get all benefits
router.get('/', (req, res) => {
    res.json(benefits);
});

// GET /api/benefits/:id - Get a specific benefit by id
router.get('/:id', (req, res) => {
    const benefit = benefits.find(b => b.id === parseInt(req.params.id));
    if (!benefit) return res.status(404).send('Benefit not found.');
    res.json(benefit);
});

// GET /api/benefits/eligibility/check - Check eligibility
router.get('/eligibility/check', (req, res) => {
    // Logic to check eligibility (270/271)
    // Placeholder for eligibility check logic
    res.send('Eligibility check is successful.');
});

module.exports = router;
