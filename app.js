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

const products = [
    {
        id: 1,
        name: "Кашпо",
        price: 45,
        image: "https://static.tildacdn.ink/tild3332-3863-4833-b038-373233356130/IMG_7721.JPG",
        imageHover: "https://static.tildacdn.ink/tild6236-3733-4633-a263-396439393539/IMG_7725.JPG",
        badge: "NEW",
        description: "Кашпо для цветов",
        fullDescription: "Кашпо изготавливаются на плетеном донышеке или на фанерном. Для улицы лучше плести кашпо из неокарённой ивы и покрыть средством для древесины. Возможно изготовление любого количества и размера."
    },
    {
        id: 2,
        name: "Корзины и кошики",
        price: 30,
        image: "https://static.tildacdn.ink/tild3338-3739-4066-b466-636531303161/IMG_8199.JPG",
        imageHover: "https://static.tildacdn.ink/tild6435-3264-4231-b038-663835316239/IMG_8192.JPG",
        badge: null,
        description: "Новые, красивые плетёные корзинки из натуральной ивы",
        fullDescription: "Можно использовать в быту, для подарков и цветов."
    },
    {
        id: 3,
        name: "Венки",
        price: 25,
        image: "https://static.tildacdn.ink/tild3164-3936-4436-b630-393464653466/20221015_105514370.jpg",
        imageHover: "https://static.tildacdn.ink/tild3838-6362-4234-b538-353231306230/noroot.jpg",
        badge: null,
        description: "Венок для декорирования из натуральной лозы",
        fullDescription: "Венки изготавливаются из очищенной и неочищенной от коры ивовой лозы. Используются для декорирования вашего дома. Стандартные размеры: 10, 15, 20, 25, 30, 35, 40, 45 см."
    },
];

app.get("/", (req, res) => {
    if (!req.session.cart) {
        req.session.cart = [];
    }
    res.render('index', { products });
});

// app.get('/cart', (req, res) => {
//     const cart = req.session.cart || [];
//     const total = cart.reduce((sum, item) => sum + item.price, 0);
//     res.render('cart', { cart, total });
// });
app.get('/cart', (req, res) => {
    console.log('🔍 Проверка корзины:', req.session.cart);
    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    res.render('cart', { cart, total });
});


app.get('/check-session', (req, res) => {
    res.json(req.session);
});



app.get('/product/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const product = products.find(p => p.id === id);
    if (!product) {
        return res.status(404).send('Товар не найден');
    }
    res.render('product', { product });
});



// app.post('/cart/add/:id', (req, res) => {
//     if (!req.session.cart) {
//         req.session.cart = [];
//     }
//     const productId = parseInt(req.params.id);
//     const product = products.find(p => p.id === productId);
//     if (product) {
//         req.session.cart.push(product);
//         res.redirect(`/product/${productId}`);
//         console.log(`товар ${product.name} добавлен`)
//     } else {
//         res.status(404).send('Товар не найден');
//     }
// });

app.post('/cart/add/:id', (req, res) => {
    // Проверяем, что было в сессии ДО добавления
    console.log('🟡 ДО добавления:', req.session.cart);
    
    if (!req.session.cart) {
        req.session.cart = [];
    }
    
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    
    if (product) {
        req.session.cart.push(product);
        console.log('✅ Товар добавлен:', product.name);
        console.log('🟢 ПОСЛЕ добавления:', req.session.cart);
        res.redirect(`/product/${productId}`);
    } else {
        res.status(404).send('Товар не найден');
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