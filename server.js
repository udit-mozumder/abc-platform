const express = require('express');
const path = require('path');
const db = require('./db');
const session = require('express-session');
const passport = require('./samlStrategy');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.static('views'));

app.use(session({
  secret: 'saml-secret',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

// 🔐 SAML Login Route
app.get('/login',
  passport.authenticate('saml', {
    failureRedirect: '/login/fail'
  }),
  (req, res) => res.redirect('/')
);

// 🔁 SAML Callback Route
app.post('/login/callback',
  passport.authenticate('saml', {
    failureRedirect: '/login/fail'
  }),
  (req, res) => {
    const email = req.user?.nameID;
    console.log('✅ SAML Response:', req.user); // Log SAML profile

    if (!email) return res.send('SAML login succeeded but no email returned.');

    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], (err, results) => {
      if (err) return res.status(500).send('❌ Database error');
      if (results.length > 0) {
        res.sendFile(path.join(__dirname, 'views', 'success.html'));
      } else {
        res.sendFile(path.join(__dirname, 'views', 'error.html'));
      }
    });
  }
);

// ❌ Failed Login
app.get('/login/fail', (req, res) => {
  res.send('❌ SAML Login Failed. Please try again.');
});

// Optional Debug Login
app.get('/abc-login', (req, res) => {
  const email = req.query.email;
  if (!email) return res.send('Missing email');

  const query = 'SELECT * FROM users WHERE email = ?';
  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).send('❌ Server error');
    if (results.length > 0) {
      res.sendFile(path.join(__dirname, 'views', 'success.html'));
    } else {
      res.sendFile(path.join(__dirname, 'views', 'error.html'));
    }
  });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on Render (PORT ${PORT})`);
});
