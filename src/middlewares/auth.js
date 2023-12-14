const jwt = require('jsonwebtoken');

const verifyJwt = (req, res, next) => {
    const token = req.session.jwt;
    if (!token) {
        return res.status(401).send('Accès refusé. Veuillez vous connecter.');
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).send('Token invalide');
    }
};
module.exports = verifyJwt;
