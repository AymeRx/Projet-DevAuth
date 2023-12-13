const connection = require('../db');

exports.getAllBlogs = (req, res, next) => {
    const sql = 'SELECT * FROM blogs';
    connection.query(sql, [], (err, result) => {
        if (err) {
            // Gérer l'erreur et passer à l'erreur suivante avec next
            next(err);
        } else {
            // Rendre la vue avec les résultats
            console.log(result)
            res.render('dashboard', { blogs: result });
        }
    });
};