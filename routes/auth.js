const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
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
        const user = new User({ username, passwordHash: hash });
        await user.save();
        res.redirect('/login');
    } catch (err) {
        console.error('Error registering user:', err);
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

    const user = await User.findOne({ username });
    if (!user) {
    return res.render('auth/login', { error: "User not found" });
    }
    const valid = await user.verifyPassword(password);
    if (!valid) {
    return res.render('auth/login', { error: "Incorrect password" });
}


    req.session.userId = user._id;
    res.redirect('/books');
});



//Logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        res.clearCookie('connect.sid');   // 🔥 removes session cookie from browser
        res.redirect('/login');
    });
});







// Show Change Password Form
router.get('/account/change-password', async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    res.render('auth/change-password', { error: null, success: null });
});

// Handle Change Password
router.post('/account/change-password', async (req, res) => {
    try {
        if (!req.session.userId) return res.redirect('/login');

        const { currentPassword, newPassword, confirmPassword } = req.body;
        const user = await User.findById(req.session.userId);

        if (!user) return res.render('auth/change-password', { error: "User not found.", success: null });

        // Check old password
        const valid = await user.verifyPassword(currentPassword);
        if (!valid) {
            return res.render('auth/change-password', { error: "Incorrect current password.", success: null });
        }

        // Confirm new password match
        if (newPassword !== confirmPassword) {
            return res.render('auth/change-password', { error: "New passwords do not match.", success: null });
        }

        // Save new password
        const bcrypt = require('bcrypt');
        user.passwordHash = await bcrypt.hash(newPassword, 10);
        await user.save();

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

        const User = require('../models/User');
        const Book = require('../models/Book');
        const Lecture = require('../models/Lecture');
        const QueueItem = require('../models/QueueItem');

        const user = await User.findById(req.session.userId);
        if (!user) {
            return res.render('auth/delete-account', { error: "User not found." });
        }

        // Confirm password
        const valid = await user.verifyPassword(req.body.password);
        if (!valid) {
            return res.render('auth/delete-account', { error: "Incorrect password." });
        }

        const userId = user._id;

        // Delete user data
        await Promise.all([
            Book.deleteMany({ user: userId }),
            Lecture.deleteMany({ user: userId }),
            QueueItem.deleteMany({ user: userId }),
            User.findByIdAndDelete(userId)
        ]);

        // Destroy session
        req.session.destroy(() => {
            res.redirect('/register');   // or '/' if you prefer
        });

    } catch (err) {
        console.error("Error deleting user account:", err);
        res.render('auth/delete-account', {
            error: "Something went wrong. Please try again."
        });
    }
});






module.exports = router;