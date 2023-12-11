const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const router = express.Router();
const connection = require('../db');
const passport = require('passport');


router.use(bodyParser.urlencoded({ extended: true }));

// Route pour la page d'inscription
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../html/register.html'));
});

router.post('/register', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        // Hachage du mot de passe avec bcrypt
        const hashedPassword = await bcrypt.hash(password, 10);
        let user_id = 0;  
    
        // Récupération du maximum user_id
        const sql_max_user_id = 'SELECT max(user_id) AS max_user_id from users';
        const maxUserIdResult = await new Promise((resolve, reject) => {
            connection.query(sql_max_user_id, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    
        user_id = maxUserIdResult[0].max_user_id + 1;
        console.log('Récupération dans la base de données.');
    
        // Insertion dans la base de données
        const sql = 'INSERT INTO users (user_id, mail, password) VALUES (?, ?, ?)';
        connection.query(sql, [user_id, username, hashedPassword], (err, result) => {
            if (err) {
                console.error('Erreur lors de l\'insertion dans la base de données :', err);
                res.status(500).send('Erreur lors de l\'inscription.');
            } else {
                console.log('Utilisateur inséré avec succès dans la base de données.');
                res.send(`Inscription réussie ! Username: ${username}`);
            }
        });
    } catch (error) {
        console.error('Erreur lors du hachage du mot de passe ou de la récupération en base de données :', error);
        res.status(500).send('Erreur lors de l\'inscription.');
    }
});


// Route pour la page de connexion
router.get('/login', (req, res) => {
    if(req.isAuthenticated()){
        res.sendFile(path.join(__dirname, '../html/dashboard.html'));
    }else{
        res.sendFile(path.join(__dirname, '../html/login.html'));
    }
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard', // rediriger vers le dashboard en cas de succès
    failureRedirect: '/login', // rediriger vers login en cas d'échec
    failureFlash: true // activer les messages flash en cas d'échec
}));

// Route pour la page de tableau de bord
router.get('/dashboard', (req, res) => {
    if (req.isAuthenticated()) {
        res.sendFile(path.join(__dirname, '../html/dashboard.html'));
    } else {
        res.redirect('/login');
    }
});

module.exports = router;
