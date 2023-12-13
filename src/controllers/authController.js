const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const blogModel = require('../models/blogModel');
const qrcode = require('qrcode');
const { authenticator } = require('otplib');

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

exports.generate2fa = async (req, res) => {
    try {
        const user = req.user.user_id; // Assurez-vous que l'utilisateur est connecté
        const service = 'My App'; // Remplacez par le nom de votre application
        const secret = authenticator.generateSecret();

        // Enregistrez le secret dans la base de données pour l'utilisateur
        await userModel.update2faSecret(user, secret);

        const otpauth = authenticator.keyuri(user, service, secret);
        const imageUrl = await qrcode.toDataURL(otpauth);

        res.render('setup-2fa', { imageUrl }); // Remplacez par votre vue EJS

    } catch (error) {
        console.error('Erreur lors de la génération du QR Code :', error);
        res.status(500).send('Erreur serveur.');
    }
};

exports.verify2fa = async (req, res) => {
    const { token } = req.body;
    const user = req.user.user_id; // Assurez-vous que l'utilisateur est connecté

    try {
        const secret = await userModel.get2faSecret(user);
        const isValid = authenticator.verify({ token, secret });

        if (!isValid) throw new Error('Token invalide.');

        // Activez la 2FA dans la base de données pour l'utilisateur
        await userModel.enable2fa(user);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Erreur lors de la vérification du token 2FA :', error);
        res.status(400).send('Token invalide ou erreur serveur.');
    }
};
