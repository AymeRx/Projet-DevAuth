const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const blogModel = require('../models/blogModel');

exports.register = async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    try {
        const name = firstName + ' ' + lastName;
        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.createUser(email, hashedPassword, name);
        res.redirect('/login');
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
    // res.redirect('/dashboard');
};

exports.checkNotAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    next();
    // res.redirect('/dashboard');
};
