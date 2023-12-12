const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

exports.register = async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.createUser(username, hashedPassword);
        res.send(`Inscription réussie ! Username: ${username}`);
    } catch (error) {
        console.error('Erreur lors de l\'inscription :', error);
        res.status(500).send('Erreur lors de l\'inscription.');
    }
};

exports.checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

exports.checkNotAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    next();
};

