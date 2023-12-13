const connection = require('../db');

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

exports.update2faSecret = (username, secret) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET 2fa_secret = ? WHERE mail = ?';
        connection.query(sql, [secret, username], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};


exports.get2faSecret = (username) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT 2fa_secret FROM users WHERE mail = ?';
        connection.query(sql, [username], (err, result) => {
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


exports.enable2fa = (username) => {
    return new Promise((resolve, reject) => {
        const sql = 'UPDATE users SET is2faEnabled = TRUE WHERE mail = ?';
        connection.query(sql, [username], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};
