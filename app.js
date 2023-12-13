const express = require('express');
const session = require('express-session');
const passport = require('passport');
const authRoutes = require('./src/routes/authRoutes');
const initializePassport = require('./src/utils/passport-config');
const app = express();
const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// Correction de la configuration de la vue EJS
app.set('views engine', 'ejs');
app.set('views', path.join(__dirname, 'src', 'views'));

initializePassport(passport);

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});