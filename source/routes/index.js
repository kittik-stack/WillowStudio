const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const cartController = require('../controllers/cartController');

router.get('/', productController.getHome);
router.get('/product/:id', productController.getProduct);
router.get('/cart', cartController.getCart);
router.post('/cart/add/:id', cartController.addToCart);
router.post('/cart/remove/:index', cartController.removeFromCart);
router.post('/cart/clear', cartController.clearCart);

module.exports = router;