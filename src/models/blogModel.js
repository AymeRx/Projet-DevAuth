const connection = require('../db');

exports.getAllBlogs = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM blogs';
        connection.query(sql, [], (err, result) => {
            if (err) {
                reject(err);
            } else {
                console.log(result);
                resolve(result); // Renvoie les résultats au lieu de les imprimer dans la console.
            }
        });
    });
};