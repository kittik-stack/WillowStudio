function getCart(req, res) {
    const cart = req.session.cart || [];
    const total = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);
    const cartCount = cart.length;
    const cartTotal = total;
    res.render('cart', { cart, total, cartCount, cartTotal });
}

function addToCart(req, res) {
    const productId = parseInt(req.params.id);
    const product = req.productsCache.find(p => p.id === productId);
    if (!product) return res.status(404).send('Товар не найден');
    
    if (!req.session.cart) req.session.cart = [];
    req.session.cart.push(product);
    res.redirect(`/product/${productId}`);
}

function removeFromCart(req, res) {
    const index = parseInt(req.params.index);
    if (req.session.cart && index < req.session.cart.length) {
        req.session.cart.splice(index, 1);
    }
    res.redirect('/cart');
}

function clearCart(req, res) {
    req.session.cart = [];
    res.redirect('/cart');
}

module.exports = { getCart, addToCart, removeFromCart, clearCart };