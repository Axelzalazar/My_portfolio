// server.js - servidor mínimo para servir archivos estáticos y API
const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname))); // sirve index.html, pages/, scripts/, styles/, etc.

// ruta para obtener productos (lee data/products.json)
app.get('/api/products', (req, res) => {
    const file = path.join(__dirname, 'data', 'products.json');
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
        console.error('read error', err);
        return res.status(500).json({ error: 'No se pudieron leer los productos' });
        }
        try {
        const products = JSON.parse(data);
        res.json(products);
        } catch (parseErr) {
        console.error('parse error', parseErr);
        res.status(500).json({ error: 'Error parseando productos' });
        }
    });
    });

    // ruta para agregar producto (simula POST a DB)
    app.post('/api/products', (req, res) => {
    const file = path.join(__dirname, 'data', 'products.json');
    const newProd = req.body;
    if (!newProd || !newProd.name || !newProd.price) {
        return res.status(400).json({ error: 'Datos incompletos' });
    }
    fs.readFile(file, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ error: 'Error lectura' });
        let arr = [];
        try { arr = JSON.parse(data); } catch(e){ arr = []; }
        newProd.id = Date.now();
        arr.push(newProd);
        fs.writeFile(file, JSON.stringify(arr, null, 2), (err) => {
        if (err) return res.status(500).json({ error: 'Error guardando' });
        res.status(201).json(newProd);
        });
    });
});

// ruta para checkout (simula procesar compra)
app.post('/api/checkout', (req, res) => {
    const cart = req.body.cart;
    if (!Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ error: 'Carrito vacío' });
    }
    // simulamos verificación y respuesta async
    setTimeout(() => {
    // validación sencilla: si algún item tiene precio <= 0, error
    const bad = cart.find(i => !i.price || i.price <= 0);
    if (bad) return res.status(400).json({ error: 'Precio inválido en carrito' });
    // simulamos id de orden
    const orderId = 'ORD-' + Date.now();
    res.json({ ok: true, orderId, message: 'Pago simulado aprobado' });
  }, 900); // simulamos latencia
});

// fallback
app.use((req, res) => {
    res.status(404).send('Not found');
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
