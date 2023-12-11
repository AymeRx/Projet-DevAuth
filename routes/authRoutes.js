const path = require('path');
const express = require('express');
const router = express.Router();

// Route pour la page d'inscription
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/register.html'));
});

// Route pour la page de connexion
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/login.html'));
});

// Route pour la page de tableau de bord
router.get('/dashboard', (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(path.join(__dirname, '../html/dashboard.html'));
    } else {
        res.redirect('/login');
    }
});

module.exports = router;
