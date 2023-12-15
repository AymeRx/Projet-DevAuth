// Importation des modules nécessaires
const express = require('express');
const path = require('path');
const router = express.Router();
const app = express();
const authController = require('../controllers/authController.js');
const blogModel = require('../models/blogModel.js');
const userModel = require('../models/userModel.js');
const passport = require('passport');
const { register } = require('module');
const e = require('express');
const jwt = require('jsonwebtoken');
const verifyJwt = require('../middlewares/auth');

// Configuration du dossier statique
app.use(express.static(path.join(__dirname, 'public')));

// Route de déconnexion
router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        // Vous pouvez ici effacer le JWT et d'autres informations de session si nécessaire
        req.session.jwt = null; // Effacez le JWT de la session
        req.session.is2faAuthenticated = false; // Réinitialisez le statut 2FA
        res.redirect('/login'); // Redirigez l'utilisateur vers la page de connexion
    });
});

// Routes pour l'inscription
router.get('/register', (req, res) => res.render('register'));
router.post('/register', authController.register);

// Routes pour la connexion
router.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/');
    } else {
        res.render('login');
    }
});

router.post('/login', passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
}), async (req, res) => {
    try {
        // Générer le JWT après une connexion réussie
        const userPayload = { id: req.user.id, email: req.user.email };
        const jwtToken = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Stocker le JWT et le statut 2FA par défaut dans la session
        req.session.jwt = jwtToken;
        req.session.is2faAuthenticated = false;

        // Vérifiez si l'utilisateur a activé la 2FA
        const is2faEnabled = await userModel.get2FaSecretUserById(req.user.user_id);

        if (is2faEnabled) {
            // Rediriger vers la page de vérification 2FA
            res.redirect('/verify-2fa');
        } else {
            // Si la 2FA n'est pas activée, rediriger vers le tableau de bord
            res.redirect('/');
        }

    } catch (error) {
        console.error('Erreur lors de la vérification de la 2FA:', error);
        res.status(500).send('Erreur interne du serveur');
    }
});



// Route du tableau de bord
router.get('/', authController.displayDashboard);

// Route d'authentification Facebook
router.get('/auth/facebook', passport.authenticate('facebook'));

// Callback après l'authentification Facebook
router.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login' }),
    (req, res) => {
        // Logique de succès, par exemple redirection vers le tableau de bord
        // Générer le JWT après une connexion réussie
        const userPayload = { id: req.user.id, email: req.user.email };
        const jwtToken = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Stocker le JWT et le statut 2FA par défaut dans la session
        req.session.jwt = jwtToken;

        res.render('/');
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
        // Générer le JWT après une connexion réussie
        const userPayload = { id: req.user.id, email: req.user.email };
        const jwtToken = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Stocker le JWT et le statut 2FA par défaut dans la session
        req.session.jwt = jwtToken;

        res.redirect('/');
    });

// Route pour démarrer l'authentification 2FA
router.get('/setup-2fa', verifyJwt, authController.generate2fa, (req, res) => {
    if (req.user.is2faEnabled) {
        res.redirect('/');
    } else {
        res.render('setup-2fa', { imageUrl: req.user.qrCode });
    }
});

// Route pour afficher la page de vérification 2FA
router.get('/verify-2fa', verifyJwt, (req, res) => {
    if (req.user.is2faEnabled) {
        res.render('verify-2fa');
    } else {
        res.redirect('/');
    }
});

// Route pour afficher la page de vérification 2FA

router.get('/my-blog', verifyJwt, authController.getMyBlog);

router.get("/add-blog",(req, res) => {
    const user_id = req.session.passport["user"];
    res.render('add-blog', {user_id});
});
router.post("/add-blog", authController.addBlog);

// Route pour afficher la page de vérification 2FA
router.get('/edit-blog/:blog_id', authController.getEditBlog);

router.get('/delete-blog/:blog_id', authController.deleteBlog)

router.post('/save-edit-blog/:blog_id', authController.updateEditBlog);

// Route de vérification du token 2FA
router.post('/verify-2fa', verifyJwt, authController.verify2fa);

// Exporte le routeur
module.exports = router;
