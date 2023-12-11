const express = require('express');
const session = require('express-session');
const passport = require('passport');

const app = express();

app.use(express.urlencoded({ extended: false })); // Pour parser les données de formulaire

// Passport configuration
const initializePassport = require('./passport-config');
initializePassport(passport);

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use(require('./routes/authRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
