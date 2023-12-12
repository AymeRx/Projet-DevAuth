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

