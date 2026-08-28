function getHome(req, res) {
    try {
        if (!req.session.cart) req.session.cart = [];
        const cartCount = req.session.cart.length;
        const cartTotal = req.session.cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
        res.render('index', { products: req.productsCache, cartCount, cartTotal });
    } catch (err) {
        console.error('Ошибка в /:', err);
        res.status(500).send('Ошибка сервера');
    }
}

function getProduct(req, res) {
    try {
        const product = req.productsCache.find(p => p.id === parseInt(req.params.id));
        if (!product) return res.status(404).send('Товар не найден');
        const cartCount = req.session.cart ? req.session.cart.length : 0;
        const cartTotal = req.session.cart ? req.session.cart.reduce((sum, item) => sum + parseFloat(item.price), 0) : 0;
        res.render('product', { product, cartCount, cartTotal });
    } catch (err) {
        console.error('Ошибка в /product/:id:', err);
        res.status(500).send('Ошибка сервера');
    }
}

module.exports = { getHome, getProduct };