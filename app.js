// Load environment variables first
require('dotenv').config();

//  Import packages
const express = require('express');

const methodOverride = require('method-override');
const { LambdaClient } = require("@aws-sdk/client-lambda");
const lambda = new LambdaClient({ region: "us-east-1" });
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const reportRoute = require('./routes/report');
const session = require('express-session');

const pool = require('./db');

// Initialize the app
const app = express();

// Middleware
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
app.use(async (req, res, next) => {
  res.locals.currentUser = null;

  if (req.session.userId) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [req.session.userId]
      );

      res.locals.currentUser = result.rows[0] || null;
    } catch (err) {
      console.error(err);
    }
  }
  next();
});


// Static files (CSS, client-side JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Allow method override for PUT/DELETE
app.use(methodOverride('_method'));


// Set EJS view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



//Provide a default title to all views
app.use((req, res, next) => {
  res.locals.title = "My Book Database";
  next();
});



app.use('/report', reportRoute);


// Routes
const booksRouter = require('./routes/books');
app.use('/books', booksRouter);

// Home route
app.get('/', (req, res) => {
  res.render('index', { title: 'My Book Database' });
});

const authRouter = require('./routes/auth');
app.use('/', authRouter);


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
