const express = require('express');
const router = express.Router();

// Mock data
let claims = [
    { id: 1, description: 'Claim 1', status: 'approved' },
    { id: 2, description: 'Claim 2', status: 'pending' },
];

// GET /api/claims - Retrieve claims list
router.get('/claims', (req, res) => {
    res.json(claims);
});

// GET /api/claims/:id - Retrieve a single claim by ID
router.get('/claims/:id', (req, res) => {
    const claim = claims.find(c => c.id === parseInt(req.params.id));
    if (claim) {
        res.json(claim);
    } else {
        res.status(404).send('Claim not found');
    }
});

// POST /api/claims/appeal - Process an appeal for a claim
router.post('/claims/appeal', (req, res) => {
    // Here, you would handle the appeal process, for example:
    const appeal = req.body;
    // Assume we save the appeal to database...
    res.status(201).send('Appeal created');
});

// GET /api/claims/:id/eob - Retrieve EOB for a claim
router.get('/claims/:id/eob', (req, res) => {
    const claim = claims.find(c => c.id === parseInt(req.params.id));
    if (claim) {
        // Mock EOB response
        res.json({ eob: `EOB information for claim ${claim.id}` });
    } else {
        res.status(404).send('Claim not found');
    }
});

// GET /api/claims/:id/eob/download - Download EOB for claim
router.get('/claims/:id/eob/download', (req, res) => {
    const claim = claims.find(c => c.id === parseInt(req.params.id));
    if (claim) {
        res.download(`path_to_eob_document_${claim.id}.pdf`); // Replace with actual path
    } else {
        res.status(404).send('Claim not found');
    }
});

module.exports = router;