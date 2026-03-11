// 1️⃣ Load environment variables first
require('dotenv').config();

// 2️⃣ Import packages
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');



const session = require('express-session');

// 3️⃣ Initialize the app
const app = express();

// 4️⃣ Middleware
// Parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'changeme',
  resave: false,
  saveUninitialized: false
}));
app.use(expressLayouts);
app.set('layout', 'layouts/main');  //default Layout file path





// Make Logged-in user info available in all EJS templates
app.use((req, res, next) => {
  res.locals.currentUser = null;
  if (req.session.userId) {
    const User = require('./models/User');
    User.findById(req.session.userId)
      .then(user => {
        res.locals.currentUser = user;
        next();
      })
      .catch(() => next());
  } else {
    next();
  }
});








// Static files (CSS, client-side JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Allow method override for PUT/DELETE
app.use(methodOverride('_method'));




// 5️⃣ Set EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 6️⃣ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));






//Provide a default title to all views
app.use((req, res, next) => {
  res.locals.title = "My Book Database";
  next();
});






// 7️⃣ Routes
const booksRouter = require('./routes/books');
app.use('/books', booksRouter);

// Home route
app.get('/', (req, res) => {
  res.render('index', { title: 'My Book Database' });
});

const authRouter = require('./routes/auth');
app.use('/', authRouter);


// 8️⃣ Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
