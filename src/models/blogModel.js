const connection = require('../db');

exports.getAllBlogs = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM blogs';
        connection.query(sql, [], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

exports.getAllBlogsPublic = () => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM blogs WHERE private=0';
        connection.query(sql, [], (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};