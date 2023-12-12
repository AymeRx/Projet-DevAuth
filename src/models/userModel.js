const connection = require('../db');

exports.createUser = (username, hashedPassword) => {
    max_user_id = this.getMaxIdUser();
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO users (user_id,mail, password) VALUES (?, ?, ?)';
        connection.query(sql, [max_user_id, username, hashedPassword], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result.insertId);
            }
        });
    });
};

exports.getMaxIdUser = () => {
    let user_id = 0;  

    // Récupération du maximum user_id
    const sql_max_user_id = 'SELECT max(user_id) AS max_user_id from users';
    const maxUserIdResult = connection.query(sql_max_user_id, (err, result) => {
        if (err) {
            reject(err);
        } else {
            resolve(result);
        }
    });

    user_id = maxUserIdResult[0].max_user_id + 1;

    return user_id;
}

// Ajoutez ici d'autres fonctions pour interagir avec la table des utilisateurs
