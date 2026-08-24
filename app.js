require('dotenv').config();
const express = require("express");
const session = require("express-session");
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
        return rows;
    } catch (err) {
        console.error("Ошибка при чтении из БД: " + err.message);
        return [];
    }
    finally {
        if (conn) conn.release();
    }

}

app.set('view engine', 'ejs');

//middleware

app.use(express.static("public"));
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
        const products = await getAllProducts();
        if (!req.session.cart) {
            req.session.cart = [];
        }
        res.render('index', { products });
    } catch (err) {
        console.error('Ошибка в /:', err);
        res.status(500).send('Ошибка сервера');
    }
});

app.get('/cart', (req, res) => {
    console.log('🔍 Проверка корзины:', req.session.cart);
    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    res.render('cart', { cart, total });
});


app.get('/check-session', (req, res) => {
    res.json(req.session);
});


app.get('/product/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const products = await getAllProducts();
        const product = products.find(p => p.id === id);

        if (!product) {
            return res.status(404).send('Товар не найден');
        }
        res.render('product', { product });
    } catch (err) {
        console.error('Ошибка в /product/:id:', err);
        res.status(500).send('Ошибка сервера');
    }
});



app.post('/cart/add/:id', async (req, res) => {
    try {
        if (!req.session.cart) req.session.cart = [];
        
        const products = await getAllProducts();
        const product = products.find(p => p.id === parseInt(req.params.id));
        
        if (!product) return res.status(404).send('Товар не найден');
        
        req.session.cart.push(product);
        res.redirect(`/product/${req.params.id}`);
    } catch (err) {
        console.error('Ошибка в /cart/add/:id:', err);
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