const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const connection = require('./db');

function initialize(passport) {
    const authenticateUser = (email, password, done) => {
        // Requête à la base de données pour trouver l'utilisateur
        connection.query('SELECT * FROM users WHERE email = ?', [email], async (err, result) => {
            if (err) { return done(err); }

            if (result.length > 0) {
                const user = result[0];

                try {
                    if (await bcrypt.compare(password, user.password)) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Password incorrect' });
                    }
                } catch (e) {
                    return done(e);
                }
            } else {
                return done(null, false, { message: 'No user with that email' });
            }
        });
    };

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        connection.query('SELECT * FROM users WHERE id = ?', [id], (err, result) => {
            done(err, result[0]);
        });
    });
}

module.exports = initialize;