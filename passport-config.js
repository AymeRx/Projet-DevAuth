const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const connection = require('./db');

function initialize(passport) {
    const authenticateUser = (username, password, done) => {
        // Recherche de l'utilisateur par username
        connection.query('SELECT * FROM users WHERE mail = ?', [username], (err, result) => {
            if (err) { return done(err); }
            if (result.length == 0) { return done(null, false, { message: 'No user with that email' }); }

            const user = result[0];

            // Comparaison du mot de passe haché
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) { return done(err); }
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Password incorrect' });
                }
            });
        });
    };

    passport.use(new LocalStrategy({ usernameField: 'username' }, authenticateUser));

    passport.serializeUser((user, done) => done(null, user.user_id));
    passport.deserializeUser((id, done) => {
        connection.query('SELECT * FROM users WHERE user_id = ?', [id], (err, result) => {
            done(err, result[0]);
        });
    });
}

module.exports = initialize;
