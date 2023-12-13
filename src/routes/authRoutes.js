const express = require('express');
const path = require('path');
const router = express.Router();
const app = express();
const authController = require('../controllers/authController.js');
const passport = require('passport');

app.use(express.static(path.join(__dirname, 'public')));

router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');  // Rediriger l'utilisateur vers la page de connexion
    });
});


router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/register.html'));
});

router.post('/register', authController.register);

router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('/dashboard');
    } else {
        res.sendFile(path.join(__dirname, '../../public/html/login.html'));
    }
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get('/dashboard', authController.checkAuthenticated, (req, res) => {
    res.render('/dashboard');
});

// Route pour démarrer l'authentification Facebook
router.get('/auth/facebook', passport.authenticate('facebook'));

// Route de callback après l'authentification Facebook
router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }),
    (req, res) => {
        // Logique de succès, par exemple redirection vers le tableau de bord
        res.render('/dashboard');
    }
);


// Route pour démarrer l'authentification Google
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route de callback après l'authentification Google
router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Logique de succès, par exemple redirection vers le tableau de bord
        res.redirect('/dashboard');
    });


module.exports = router;
