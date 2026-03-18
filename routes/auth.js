const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const pool = require('../db');
const router = express.Router();

//Show registration form
router.get('/register', (req, res) => {
    res.render('auth/register');
});

// Handle Registration
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hash = await bcrypt.hash(password, 10);

await pool.query(
  'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
  [username, hash]
);

res.redirect('/login');
    } catch (err) {
        console.error('FULL ERROR', err);
        console.error('STACK:', err.stack);
        res.send('Registration failed (username may already exist).');
    }
});

//Show Login form
router.get('/login', (req, res) => {
    res.render('auth/login', { error: null });
});


//Handle Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    const user = await User.findByUsername(username);
    if (!user) {
    return res.render('auth/login', { error: "User not found" });
    }
    const valid = await User.verifyPassword(user, password);
    if (!valid) {
    return res.render('auth/login', { error: "Incorrect password" });
}


    req.session.userId = user.id;
    res.redirect('/books');
});



//Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        res.clearCookie('connect.sid');   // 🔥 removes session cookie from browser
        res.redirect('/login');
    });
});





router.get('/account/change-password', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  res.render('auth/change-password', { error: null, success: null });
});

// Show Change Password Form
router.post('/account/change-password', async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect('/login');

    const { currentPassword, newPassword, confirmPassword } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.session.userId]
    );

    const user = result.rows[0];

    if (!user) {
      return res.render('auth/change-password', { error: "User not found.", success: null });
    }

    const valid = await User.verifyPassword(user, currentPassword);
    if (!valid) {
      return res.render('auth/change-password', { error: "Incorrect current password.", success: null });
    }

    if (newPassword !== confirmPassword) {
      return res.render('auth/change-password', { error: "New passwords do not match.", success: null });
    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newHash, req.session.userId]
    );

    res.render('auth/change-password', { error: null, success: "Password updated successfully!" });
  } catch (err) {
    console.error(err);
    res.render('auth/change-password', { error: "Something went wrong.", success: null });
  }
});


// Show "Delete Account" page
router.get('/account/delete', (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    res.render('auth/delete-account', { error: null });
});


// Handle Account Deletion
router.post('/account/delete', async (req, res) => {
  try {
    if (!req.session.userId) return res.redirect('/login');

    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.session.userId]
    );

    const user = result.rows[0];

    if (!user) {
      return res.render('auth/delete-account', { error: "User not found." });
    }

    const valid = await User.verifyPassword(user, req.body.password);
    if (!valid) {
      return res.render('auth/delete-account', { error: "Incorrect password." });
    }

    const userId = req.session.userId;

    await pool.query('DELETE FROM books WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    req.session.destroy(() => {
      res.redirect('/register');
    });

  } catch (err) {
    console.error('Error deleting user account:', err);
    res.render('auth/delete-account', {
      error: "Something went wrong. Please try again."
    });
  }
});



module.exports = router;