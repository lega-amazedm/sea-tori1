const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('orders.db');

// Создать таблицу заказов, если нет
db.run(`CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  phone TEXT,
  address TEXT,
  payment TEXT,
  items TEXT,
  total INTEGER,
  status TEXT,
  created INTEGER
)`);

// Получить все заказы
app.get('/orders', (req, res) => {
  db.all('SELECT * FROM orders ORDER BY created DESC', [], (err, rows) => {
    if (err) return res.status(500).json({error: err.message});
    res.json(rows);
  });
});

// Добавить заказ
app.post('/orders', (req, res) => {
  const { name, phone, address, payment, items, total } = req.body;
  db.run(
    `INSERT INTO orders (name, phone, address, payment, items, total, status, created)
     VALUES (?, ?, ?, ?, ?, ?, 'new', ?)`,
    [name, phone, address, payment, JSON.stringify(items), total, Date.now()],
    function(err) {
      if (err) return res.status(500).json({error: err.message});
      res.json({ id: this.lastID });
    }
  );
});

// Изменить статус заказа
app.post('/orders/:id/status', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id], function(err) {
    if (err) return res.status(500).json({error: err.message});
    res.json({ success: true });
  });
});

app.listen(3001, () => console.log('Server started on http://localhost:3001'));
