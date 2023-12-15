const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const blogModel = require('../models/blogModel');
const qrcode = require('qrcode');
const { authenticator } = require('otplib');
const jwt = require('jsonwebtoken');
const verifyJwt = require('../middlewares/auth');

exports.register = async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    try {
        const name = firstName + ' ' + lastName;
        const hashedPassword = await bcrypt.hash(password, 10);
        await userModel.createUser(email, hashedPassword, name);
        res.redirect('/login');
    } catch (error) {
        console.error('Erreur lors de l\'inscription :', error);
        res.status(500).send('Erreur lors de l\'inscription.');
    }
};


exports.generate2fa = async (req, res) => {
    try {
        const userId = req.session.passport["user"]; // Assurez-vous que l'utilisateur est connecté
        const service = 'My App'; // Remplacez par le nom de votre application
        const secret = authenticator.generateSecret();

        // Enregistrez le secret dans la base de données pour l'utilisateur
        await userModel.update2faSecret(userId, secret);

        const otpauth = authenticator.keyuri(userId, service, secret);
        const imageUrl = await qrcode.toDataURL(otpauth);

        res.render('setup-2fa', { imageUrl }); // Remplacez par votre vue EJS
    } catch (error) {
        console.error('Erreur lors de la génération du QR Code :', error);
        res.status(500).send('Erreur serveur.');
    }
};

exports.verify2fa = async (req, res) => {
    const { token } = req.body;
    const userId = req.session.passport["user"];

    try {
        const secret = await userModel.get2faSecret(user);
        const isValid = authenticator.verify({ token, secret });

        if (!isValid) {
            throw new Error('Token invalide.');
        }

        // Activez la 2FA dans la base de données pour l'utilisateur
        await userModel.enable2fa(user);

        // Mettez à jour la session pour indiquer que l'utilisateur a réussi la vérification 2FA
        req.session.is2faAuthenticated = true;

        res.redirect('/');
    } catch (error) {
        console.error('Erreur lors de la vérification du token 2FA :', error);
        res.status(400).send('Token invalide ou erreur serveur.');
    }
};


exports.getMyBlog = async (req, res) => {
    const userId = req.session.passport["user"];
    try{
        const myBlogs = await blogModel.getBlogsByUserId(userId);
        const user = await userModel.getUserById(userId);
        res.render("my-blog", { myBlogs, user });
    } catch (error) {
        console.error('Erreur lors de la récupération des blogs de l\'utilisateur ', userId, ' :', error);
        res.status(500).send('Blogs non récupérés');
    }
}

exports.getEditBlog = async (req,res) => {
    const blog_id = req.params.blog_id;
    const userId = req.session.passport["user"];

    try{
        const editBlog = await blogModel.getBlogById(blog_id);
        res.render("edit-blog", { editBlog, userId });
    } catch (error) {
        console.error('Erreur lors de la récupération du blog : ', blog_id, ' :', error);
        res.status(500).send('Blog non récupéré');
    }
};

exports.updateEditBlog = async (req,res) => {
    const blog_id = req.params.blog_id;
    const title = req.body.label_blog;
    const text = req.body.description;
    try{
        await blogModel.updateEditBlog(blog_id, title, text);
        res.redirect("/my-blog");
    } catch (error) {
        console.error('Erreur lors de la modification du blog : ', blog_id, ' :', error);
        res.status(500).send('Blog non modifié');
    }
};

exports.addBlog = async (req,res) => {
    const user_id = req.session.passport["user"];
    const title = req.body.label_blog;
    const text = req.body.description;
    try{
        await blogModel.addBlog(user_id, title, text);
        res.redirect("/my-blog");
    } catch (error) {
        console.error('Erreur lors de l\'ajout du blog : ', error);
        res.status(500).send('Blog non ajouté');
    }
};

exports.deleteBlog = async (req,res) => {
    const blog_id = req.params.blog_id;

    try{
        await blogModel.deleteBlog(blog_id);
        res.redirect("/my-blog");
    } catch (error){
        console.error('Erreur lors de la supression du blog : ', error);
        res.status(500).send('Blog non supprimé');
    }
};

exports.displayDashboard = async (req,res) =>{
    let user_id = null;
    if (req.session.passport){
        user_id = req.session.passport["user"];
    }
    let blogs = await blogModel.getAllBlogsPublic();
    let users = await userModel.getAllUsers();
    let is2faEnabled = false;
    let isAuthenticated = false;
    try {
        if (user_id != null && verifyJwt){
            blogs = await blogModel.getAllBlogs();
            is2faEnabled = await userModel.get2faEnabled(user_id);
            if (is2faEnabled == 1 ){
                is2faEnabled = true;
            }else{
                is2faEnabled = false;
            }
            isAuthenticated = true; 
        }
        res.render('dashboard', { blogs, users, is2faEnabled, isAuthenticated});
    } catch (error) {
        console.error('Erreur lors de la récupération des blogs ou des utilisateurs:', error);
        res.status(500).send('Erreur serveur.');
    }
};