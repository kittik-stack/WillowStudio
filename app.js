require('dotenv').config();
const express = require("express");
const session = require("express-session");
const path = require('path');
const fs = require("fs");
const mysql = require("mysql2/promise");
const app = express();

const PORT = process.env.PORT;
const HOST = process.env.HOST;

const db_name = process.env.DB_NAME;
const db_host = process.env.DB_HOST;
const db_port = process.env.DB_PORT;
const db_user = process.env.DB_USER;
const db_password = process.env.DB_PASSWORD;

const secret = process.env.SECRET;

const pool = mysql.createPool({
    host: db_host,
    user: db_user,
    port: db_port,
    database: db_name,
    password: db_password,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function getAllProducts() {
    let conn;
    try {
        conn = await pool.getConnection();
        const [rows] = await conn.query('SELECT * FROM product');
        console.log(`Прочитано ${rows.length} товаров из БД.`);
        const products = rows.map(p => ({
        ...p,
        price: parseFloat(p.price)
    }));
    return products;
    } catch (err) {
        console.error("Ошибка при чтении из БД: " + err.message);
        return [];
    }
    finally {
        if (conn) conn.release();
    }

}

let productsCache = [];

async function updateProductsCache() {
try {
        productsCache = await getAllProducts();
        console.log(`Кэш обновлён: ${productsCache.length} товаров`);
    } catch (err) {
        console.error('Ошибка при обновлении кэша:', err);
        productsCache = [];
    }
}

function isAdmin(req, res, next) {
    if(req.sessionisAdmin){
        next();
    } else {
        res.redirect('/admin/login');
    }
}

updateProductsCache();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'source', 'views'));
app.use(express.static(path.join(__dirname, 'source', 'public')));
app.use('/images', express.static(path.join(__dirname, '..', 'images')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: secret,
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use((req, res, next) => {
    const now = new Date();
    const hour = now.getHours();
    const min = now.getMinutes();
    const sec = now.getSeconds();
    const data = `${hour}:${min}:${sec} ${req.method} ${req.url}`;
    //console.log(data);
    fs.appendFile("server.log", data + "\n", function (error) {
        if (error) return console.log(error);
    });
    next();
});
  

app.get("/", async (req, res) => {
    try {
        if (!req.session.cart) req.session.cart = [];
        const cartCount = req.session.cart.length;
        const cartTotal = req.session.cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
        res.render('index', { products: productsCache, cartCount, cartTotal });
    } catch (err) {
        console.error('Ошибка в /:', err);
        res.status(500).send('Ошибка сервера');
    }
});

app.get('/cart', (req, res) => {
    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
    const cartCount = cart.length;
    res.render('cart', { cart, total, cartCount, cartTotal: total });
});

app.get('/product/:id', async (req, res) => {
    try {
        const product = productsCache.find(p => p.id === parseInt(req.params.id));
        if (!product) return res.status(404).send('Товар не найден');
        const cartCount = req.session.cart ? req.session.cart.length : 0;
        const cartTotal = req.session.cart ? req.session.cart.reduce((sum, item) => sum + parseFloat(item.price), 0) : 0;
        res.render('product', { product, cartCount, cartTotal });
    } catch (err) {
        console.error('Ошибка в /product/:id:', err);
        res.status(500).send('Ошибка сервера');
    }
});


app.post('/cart/add/:id', async (req, res) => {
    try {
        if (!req.session.cart) req.session.cart = [];

        const product = productsCache.find(p => p.id === parseInt(req.params.id));

        if (!product) return res.status(404).send('Товар не найден');

        req.session.cart.push(product);
        res.redirect(`/product/${req.params.id}`);
    } catch (err) {
        console.error('Ошибка в /cart/add/:id:', err);
        res.status(500).send('Ошибка сервера');
    }
});

app.post('/admin/products', async (req, res) => {
    await pool.query('INSERT INTO product ...', [name, price]);
    await updateProductsCache();
    res.redirect('/admin');
});

app.get('/admin/add', (req, res) => {
    res.send(`
        <form action="/admin/add" method="POST">
            <input name="name" placeholder="Название" required>
            <input name="price" placeholder="Цена" type="number" required>
            <input name="image" placeholder="URL картинки">
            <input name="imageHover" placeholder="URL второй картинки (опционально)">
            <input name="badge" placeholder="Бейдж (например, NEW)">
            <input name="description" placeholder="Краткое описание">
            <input name="fullDescription" placeholder="Полное описание">
            <button type="submit">Добавить товар</button>
        </form>
    `);
});

app.post('/admin/add', async (req, res) => {
    try {
        const { name, price, image, imageHover, badge, description, fullDescription } = req.body;
        
        await pool.query(
            `INSERT INTO product 
            (name, price, image, imageHover, badge, description, fullDescription) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, price, image, imageHover || null, badge || null, description || null, fullDescription || null]
        );
        
        await updateProductsCache();
        res.send(' Товар добавлен <a href="/admin/add">Добавить ещё</a>');
    } catch (err) {
        console.error('Ошибка при добавлении:', err);
        res.status(500).send('Ошибка сервера');
    }
});

app.post('/cart/remove/:index', (req, res) => {
    const index = parseInt(req.params.index);
    if (req.session.cart && index < req.session.cart.length) {
        req.session.cart.splice(index, 1);
    }
    res.redirect('/cart');
});

app.post('/cart/clear', (req, res) => {
    req.session.cart = [];
    res.redirect('/cart');
});


app.listen(PORT, () => {
    console.log(`try server on http://${HOST}:${PORT}`);
});