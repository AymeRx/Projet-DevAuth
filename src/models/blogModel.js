// Importe la connexion à la base de données depuis le fichier db.js
const connection = require('../db');

// Récupère tous les blogs de la base de données
exports.getAllBlogs = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM blogs'; // Requête SQL pour sélectionner tous les blogs
        connection.query(sql, [], (err, result) => {
            if (err) {
                reject(err); // Rejette la promesse en cas d'erreur lors de l'exécution de la requête
            } else {
                resolve(result); // Résout la promesse avec le résultat de la requête
            }
        });
    });
};

// Récupère tous les blogs publics de la base de données
exports.getAllBlogsPublic = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM blogs WHERE private=0'; // Requête SQL pour sélectionner les blogs publics
        connection.query(sql, [], (err, result) => {
            if (err) {
                reject(err); // Rejette la promesse en cas d'erreur lors de l'exécution de la requête
            } else {
                resolve(result); // Résout la promesse avec le résultat de la requête
            }
        });
    });
};
