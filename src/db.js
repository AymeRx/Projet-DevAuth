// Importe le module MySQL
const mysql = require('mysql');

// Crée une connexion à la base de données MySQL avec les informations de connexion
const connection = mysql.createConnection({
    host: 'mysql-matthieu-73.alwaysdata.net',      // Adresse du serveur MySQL
    user: '339794_aymeric',                        // Nom d'utilisateur MySQL
    password: '339794_aymeric_projet_dev_auth',    // Mot de passe MySQL
    database: 'matthieu-73_projet_dev_auth'        // Nom de la base de données MySQL
});

// Établit la connexion à la base de données
connection.connect(err => {
    if (err) throw err; // Lance une erreur en cas d'échec de la connexion
    console.log('Connected to MySQL Database!'); // Affiche un message de réussite en cas de connexion réussie
});

// Exporte la connexion pour qu'elle puisse être utilisée dans d'autres parties de l'application
module.exports = connection;
