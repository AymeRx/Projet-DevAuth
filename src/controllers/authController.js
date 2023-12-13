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
};

exports.checkNotAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    next();
};

exports.allBlogs = async (req, res, next) => {
    try {
        const blogs = await blogModel.getAllBlogs();
        // Correction : Utilisation de res.render pour afficher la vue EJS
        res.render('dashboard', { blogs });
    } catch (error) {
        console.error('Erreur lors de la récupération des blogs :', error);
        res.status(500).send('Erreur lors de la récupération des blogs.');
    }
};