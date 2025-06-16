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

// ✅ Robust SAML Callback Route with full logging
app.post('/login/callback',
  passport.authenticate('saml', {
    failureRedirect: '/login/fail'
  }),
  (req, res) => {
    try {
      const profile = req.user;
      console.log('✅ SAML Profile:', profile); // Full SAML assertion

      const email = profile?.nameID || profile?.email || profile?.userPrincipalName;

      if (!email) {
        console.error('❌ No email found in SAML response:', profile);
        return res.status(400).send('SAML login succeeded, but no email returned.');
      }

      const query = 'SELECT * FROM users WHERE email = ?';
      db.query(query, [email], (err, results) => {
        if (err) {
          console.error('❌ DB Error:', err);
          return res.status(500).send('❌ Database error');
        }

        if (results.length > 0) {
          console.log('✅ User found:', results[0]);
          res.sendFile(path.join(__dirname, 'views', 'success.html'));
        } else {
          console.warn('⚠️ User not found in DB:', email);
          res.sendFile(path.join(__dirname, 'views', 'error.html'));
        }
      });
    } catch (err) {
      console.error('❌ Unhandled Callback Error:', err);
      res.status(500).send('❌ Internal server error during SAML callback');
    }
  }
);

// ❌ Failed Login
app.get('/login/fail', (req, res) => {
  res.send('❌ SAML Login Failed. Please try again.');
});

// 🔍 Optional direct check (manual test)
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
