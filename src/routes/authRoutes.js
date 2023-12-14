// Importation des modules nécessaires
const express = require('express');
const path = require('path');
const router = express.Router();
const app = express();
const authController = require('../controllers/authController.js');
const blogModel = require('../models/blogModel.js');
const userModel = require('../models/userModel.js');
const passport = require('passport');

// Configuration du dossier statique
app.use(express.static(path.join(__dirname, 'public')));

// Route de déconnexion
router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/login');  // Rediriger l'utilisateur vers la page de connexion
    });
});

// Route d'affichage du formulaire d'inscription
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/html/register.html'));
});

// Route de traitement du formulaire d'inscription
router.post('/register', authController.register);

// Route d'affichage de la page de connexion
router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        // Vérification si le 2FA est activé
        if (req.user.is2faEnabled) {
            res.redirect('/test-login');
        } else {
            res.redirect('/dashboard');
        }
    } else {
        res.sendFile(path.join(__dirname, '../../public/html/login.html'));
    }
});

// Route de vérification de l'authentification après le login
router.get("/test-login", authController.checkAuthenticated, async (req, res) => {
    // Vérification si le 2FA est activé
    if (req.user.is2faEnabled) {
        res.redirect('/verify-2fa');
    } else {
        res.redirect('/setup-2fa');
    }
});

// Route de traitement du formulaire de connexion
router.post('/login', passport.authenticate('local', {
    successRedirect: '/test-login',
    failureRedirect: '/login',
    failureFlash: true
}));

// Route d'affichage du tableau de bord
router.get('/dashboard', async (req, res) => {

    let blogs = []; // Définir blogs à une valeur par défaut
    let isAuthenticated = false;
    let is2fa = false;
    let users = [];
    try {
        if (req.isAuthenticated()) {
            isAuthenticated = true;
            blogs = await blogModel.getAllBlogs();
            is2fa = await userModel.get2FaSecretUserById(req.user.user_id);
            users = await userModel.getAllUsers();
        } else {
            blogs = await blogModel.getAllBlogsPublic();
        }

    } catch (error) {
        console.error('Erreur lors de la récupération des blogs :', error);
        return res.status(500).send('Erreur lors de la récupération des blogs.');
    }
    res.render('dashboard', { blogs, users, isAuthenticated, is2fa });
});

// Route d'authentification Facebook
router.get('/auth/facebook', passport.authenticate('facebook'));

// Callback après l'authentification Facebook
router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }),
    (req, res) => {
        // Logique de succès, par exemple redirection vers le tableau de bord
        res.render('dashboard');
    }
);

// Route d'authentification Google
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback après l'authentification Google
router.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Logique de succès, par exemple redirection vers le tableau de bord
        res.redirect('dashboard');
    });

// Route pour démarrer l'authentification 2FA
router.get('/setup-2fa', authController.checkAuthenticated, authController.generate2fa);

// Route pour afficher la page de vérification 2FA
router.get('/verify-2fa', authController.checkAuthenticated, (req, res) => {
    res.render('verify-2fa');
});

// Route pour afficher la page de vérification 2FA
router.get('/my-blog',authController.checkAuthenticated, authController.getMyBlog);

router.get("/add-blog/:user_id",(req, res) => {
    const user_id = req.params.user_id;
    res.render('add-blog', {user_id});
});
router.post("/add-blog/:user_id", authController.addBlog);

// Route pour afficher la page de vérification 2FA
router.get('/edit-blog/:blog_id', authController.getEditBlog);

router.post('/save-edit-blog/:blog_id', authController.updateEditBlog);

// Route de vérification du token 2FA
router.post('/verify-2fa', authController.checkAuthenticated, authController.verify2fa);

// Exporte le routeur
module.exports = router;
