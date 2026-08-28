const pool = require('../config/db');

async function getAllProducts() {
    let conn;
    try {
        conn = await pool.getConnection();
        const [rows] = await conn.query('SELECT * FROM product');
        return rows.map(p => ({ ...p, price: parseFloat(p.price) }));
    } finally {
        if (conn) conn.release();
    }
}

async function addProduct(data) {
    const { name, price, image, imageHover, badge, description, fullDescription } = data;
    const conn = await pool.getConnection();
    try {
        await conn.query(
            `INSERT INTO product (name, price, image, imageHover, badge, description, fullDescription) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, price, image, imageHover || null, badge || null, description || null, fullDescription || null]
        );
    } finally {
        conn.release();
    }
}

async function deleteProduct(id) {
    const conn = await pool.getConnection();
    try {
        await conn.query('DELETE FROM product WHERE id = ?', [id]);
    } finally {
        conn.release();
    }
}

module.exports = { getAllProducts, addProduct, deleteProduct };