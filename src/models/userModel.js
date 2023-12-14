// Importation de la connexion à la base de données
const connection = require('../db');

// Fonction pour créer un utilisateur dans la base de données
exports.createUser = (username, hashedPassword, name) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO users (mail, password, name) VALUES (?, ?, ?)';
        connection.query(sql, [username, hashedPassword, name], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.insertId);
            }
        });
    });
};

// Fonction pour mettre à jour la clé secrète 2FA d'un utilisateur
exports.update2faSecret = (userId, secret) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET 2fa_secret = ? WHERE user_id = ?';
        connection.query(sql, [secret, userId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// Fonction pour récupérer la clé secrète 2FA d'un utilisateur
exports.get2faSecret = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT 2fa_secret FROM users WHERE user_id = ?';
        connection.query(sql, [userId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                if (result && result.length > 0) {
                    resolve(result[0]['2fa_secret']); // Utilisez la syntaxe de crochet
                } else {
                    resolve(null); // Ou rejetez, selon la logique de votre application
                }
            }
        });
    });
};

// Fonction pour activer la 2FA pour un utilisateur
exports.enable2fa = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET is2faEnabled = TRUE WHERE user_id = ?';
        connection.query(sql, [userId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// Fonction pour vérifier si un utilisateur a activé la 2FA
exports.get2FaSecretUserById = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE user_id = ? and 2fa_secret=NULL';
        connection.query(sql, [userId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                console.log(result);
                if (result && result.length > 0) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            }
        });
    });
};

// Fonction pour récupérer tous les utilisateurs de la base de données
exports.getAllUsers = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users';
        connection.query(sql, [], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

exports.getUserById = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE user_id = ?';
        connection.query(sql, [userId], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}