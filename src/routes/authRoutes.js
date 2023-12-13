const express = require('express');
const path = require('path');
const router = express.Router();
const app = express();
const authController = require('../controllers/authController.js');
const blogModel = require('../models/blogModel.js');
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
    // if (req.isAuthenticated()) {
    //     res.render('dashboard');
    // } else {
    //     res.sendFile(path.join(__dirname, '../../public/html/login.html'));
    // }
    res.sendFile(path.join(__dirname, '../../public/html/login.html'));
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

// router.get('/dashboard', authController.checkAuthenticated, async (req, res) => {
router.get('/dashboard', async (req, res) => {
   
    let blogs = []; // Définir blogs à une valeur par défaut

    try {
        if (req.isAuthenticated()) {
            blogs = await blogModel.getAllBlogs();
        } else {
            blogs = await blogModel.getAllBlogsPublic();
        }
        console.log(blogs);
    } catch (error) {
        console.error('Erreur lors de la récupération des blogs :', error);
        return res.status(500).send('Erreur lors de la récupération des blogs.');
    }

    res.render('dashboard', { blogs });
});

// Route pour démarrer l'authentification Facebook
router.get('/auth/facebook', passport.authenticate('facebook'));

// Route de callback après l'authentification Facebook
router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }),
    (req, res) => {
        // Logique de succès, par exemple redirection vers le tableau de bord
        res.render('dashboard');
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
        res.redirect('dashboard');
    });


module.exports = router;
