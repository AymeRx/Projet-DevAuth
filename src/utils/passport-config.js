const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcrypt');
const connection = require('../db');
const User = require('../models/userModel');
require('dotenv').config(); 

module.exports = function initialize(passport) {
    // LocalStrategy
    passport.use(new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
        connection.query('SELECT * FROM users WHERE mail = ?', [username], (err, result) => {
            if (err) { return done(err); }
            if (result.length === 0) { return done(null, false, { message: 'No user with that email' }); }

            const user = result[0];
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) { return done(err); }
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Password incorrect' });
                }
            });
        });
    }));

    // FacebookStrategy
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "http://localhost:3000/auth/facebook/callback"
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            connection.query('SELECT * FROM users WHERE other_app_id = ?', [profile.id], (err, result) => {
                if (err) { return done(err); }
    
                if (result.length > 0) {
                    // L'utilisateur existe déjà, connectez l'utilisateur
                    return done(null, result[0]);
                } else {
                    // Créez un nouvel utilisateur
                    console.log(profile.id);
                    const newUserQuery = 'INSERT INTO users (user_id, other_app_id) VALUES (?, ?)';
                    connection.query(newUserQuery, [User.getMaxIdUser(), profile.id], (err, result) => {
                        if (err) { return done(err); }
                        const newUser = {
                            user_id: result.insertId,
                            other_app_id: profile.id
                        };
                        return done(null, newUser);
                    });
                }
            });
        } catch (err) {
            return done(err);
        }
    }));

    // Sérialisation et Désérialisation
    passport.serializeUser((user, done) => done(null, user.user_id));
    passport.deserializeUser((id, done) => {
        connection.query('SELECT * FROM users WHERE user_id = ?', [id], (err, result) => {
            done(err, result[0]);
        });
    });
};
