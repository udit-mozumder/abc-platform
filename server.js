const express = require('express');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('views'));

// Route: Check if user exists based on email
app.get('/abc-login', (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.send('Missing email query param.');
  }

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).send('Server error');
    if (results.length > 0) {
      res.sendFile(path.join(__dirname, 'views', 'success.html'));
    } else {
      res.sendFile(path.join(__dirname, 'views', 'error.html'));
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
