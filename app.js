require('dotenv').config();
const express = require("express");
const session = require("express-session");
const path = require('path');
const app = express();

const indexRoutes = require('./source/routes/index');
const adminRoutes = require('./source/routes/admin');
const logger = require('./source/middleware/logger');
const productModel = require('./source/models/productModel');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'source', 'views'));
app.use(express.static(path.join(__dirname, 'source', 'public')));
app.use('/images', express.static(path.join(__dirname, 'source', 'public', 'images')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(logger); 
let productsCache = [];

async function updateCache() {
    productsCache = await productModel.getAllProducts();
    console.log(`Кэш обновлён: ${productsCache.length} товаров`);
}

app.use((req, res, next) => {
    req.productsCache = productsCache;
    req.updateCache = updateCache;
    next();
});

updateCache();

app.use('/', indexRoutes);
app.use('/admin', adminRoutes);

app.listen(process.env.PORT, () => {
    console.log(`try server on http://${process.env.HOST}:${process.env.PORT}`);
});