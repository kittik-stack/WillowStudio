const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middleware/auth');

router.get('/login', adminController.getLogin);
router.post('/login', adminController.postLogin);
router.get('/logout', adminController.logout);
router.get('/dashboard', isAdmin, adminController.getDashboard);
router.get('/add', isAdmin, adminController.getAddForm);
router.post('/add', isAdmin, adminController.addProduct);
router.post('/delete/:id', isAdmin, adminController.deleteProduct);

module.exports = router;