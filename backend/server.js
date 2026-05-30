const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./database');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'supersecretkey_for_simple_app';

app.use(cors());
app.use(express.json());

// Middleware to verify JWT
const authenticate = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Acceso denegado' });
  
  try {
    const verified = jwt.verify(token.replace('Bearer ', ''), SECRET_KEY);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Token no válido' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Requiere permisos de administrador' });
  }
  next();
};

// --- AUTH ROUTES ---
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Faltan credenciales' });

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

    // Compare stored hashed password
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '8h' });
    res.json({ token, role: user.role, username: user.username });
  });
});

// --- PRODUCTS ROUTES ---
// Get all products (Public)
app.get('/api/products', (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get single product (Public)
app.get('/api/products/:id', (req, res) => {
  db.get("SELECT * FROM products WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Create product (Admin only)
app.post('/api/products', authenticate, isAdmin, (req, res) => {
  const { name, description, price, stock, image_url } = req.body;
  db.run(`INSERT INTO products (name, description, price, stock, image_url) VALUES (?, ?, ?, ?, ?)`,
    [name, description, price, stock, image_url],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name, description, price, stock, image_url });
    }
  );
});

// Update product (Admin only)
app.put('/api/products/:id', authenticate, isAdmin, (req, res) => {
  const { name, description, price, stock, image_url } = req.body;
  db.run(`UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image_url = ? WHERE id = ?`,
    [name, description, price, stock, image_url, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Producto actualizado' });
    }
  );
});

// Delete product (Admin only)
app.delete('/api/products/:id', authenticate, isAdmin, (req, res) => {
  db.run(`DELETE FROM products WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Producto eliminado' });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
