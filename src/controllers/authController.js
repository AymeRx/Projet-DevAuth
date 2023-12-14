const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const blogModel = require('../models/blogModel');
const qrcode = require('qrcode');
const { authenticator } = require('otplib');
const jwt = require('jsonwebtoken');

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

exports.checkAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
    // res.redirect('/dashboard');
};

exports.checkNotAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.redirect('/dashboard');
    }
    next();
    // res.redirect('/dashboard');
};

exports.generate2fa = async (req, res) => {
    try {
        const user = req.user.user_id; // Assurez-vous que l'utilisateur est connecté
        const service = 'My App'; // Remplacez par le nom de votre application
        const secret = authenticator.generateSecret();

        // Enregistrez le secret dans la base de données pour l'utilisateur
        await userModel.update2faSecret(user, secret);

        const otpauth = authenticator.keyuri(user, service, secret);
        const imageUrl = await qrcode.toDataURL(otpauth);

        res.render('setup-2fa', { imageUrl }); // Remplacez par votre vue EJS
    } catch (error) {
        console.error('Erreur lors de la génération du QR Code :', error);
        res.status(500).send('Erreur serveur.');
    }
};

exports.verify2fa = async (req, res) => {
    const { token } = req.body;
    const user = req.user.user_id;

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

        // Générer le JWT après une vérification 2FA réussie
        const userPayload = { id: req.user.id, email: req.user.email };
        const jwtToken = jwt.sign(userPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Stocker le JWT dans la session
        req.session.jwt = jwtToken;

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Erreur lors de la vérification du token 2FA :', error);
        res.status(400).send('Token invalide ou erreur serveur.');
    }
};


exports.getMyBlog = async (req, res) => {
    const userId = req.user.user_id;

    try{
        const myBlogs = await blogModel.getBlogsByUserId(userId);
        const user = await userModel.getUserById(userId);
        console.log(user);
        res.render("my-blog", { myBlogs, user });
    } catch (error) {
        console.error('Erreur lors de la récupération des blogs de l\'utilisateur ', userId, ' :', error);
        res.status(500).send('Blogs non récupérés');
    }
}

exports.getEditBlog = async (req,res) => {
    const blog_id = req.params.blog_id;
    const user_id = req.params.user_id;

    try{
        const editBlog = await blogModel.getBlogById(blog_id);
        res.render("edit-blog", { editBlog, user_id });
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
    const user_id = req.params.user_id;
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