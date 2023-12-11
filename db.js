const mysql = require('mysql');
const connection = mysql.createConnection({
    host: 'mysql-matthieu-73.alwaysdata.net',
    user: '339794_aymeric',
    password: '339794_aymeric_projet_dev_auth',
    database: 'matthieu-73_projet_dev_auth'
});

connection.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL Database!');
});

module.exports = connection;
