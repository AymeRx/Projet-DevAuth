const connection = require('../db');

exports.createUser = (username, hashedPassword) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO users (mail, password) VALUES (?, ?)';
        connection.query(sql, [username, hashedPassword], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.insertId);
            }
        });
    });
};

// Ajoutez ici d'autres fonctions pour interagir avec la table des utilisateurs
