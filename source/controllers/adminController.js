const productModel = require('../models/productModel');

function getLogin(req, res) {
    if (req.session.isAdmin) return res.redirect('/admin/dashboard');
    res.render('admin/login', { error: null });
}

function postLogin(req, res) {
    const { password } = req.body;
    if (password === process.env.ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.redirect('/admin/dashboard');
    } else {
        res.render('admin/login', { error: 'Неверный пароль' });
    }
}

function logout(req, res) {
    req.session.isAdmin = false;
    res.redirect('/admin/login');
}

async function getDashboard(req, res) {
    res.render('admin/dashboard', { products: req.productsCache });
}

function getAddForm(req, res) {
    res.render('admin/add');
}

async function addProduct(req, res) {
    try {
        await productModel.addProduct(req.body);
        await req.updateCache();
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error('Ошибка при добавлении:', err);
        res.status(500).send('Ошибка сервера');
    }
}

async function deleteProduct(req, res) {
    try {
        const id = parseInt(req.params.id);
        await productModel.deleteProduct(id);
        await req.updateCache();
        res.redirect('/admin/dashboard');
    } catch (err) {
        console.error('Ошибка при удалении:', err);
        res.status(500).send('Ошибка сервера');
    }
}

module.exports = { getLogin, postLogin, logout, getDashboard, getAddForm, addProduct, deleteProduct };