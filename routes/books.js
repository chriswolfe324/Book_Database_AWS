const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { parseSort, getPagination } = require('./utils/query');
const pool = require('../db');

function requireLogin(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
}

//Protect all /books routes
router.use(requireLogin);

// Show 'New Book' form
router.get('/new', (req, res) => {
    res.render('books/new'); //Looks for views/books/new.ejs
});

//Handle form submission
router.post('/', async (req, res) => {
  try {
    const userId = req.session.userId;

      await Book.createBook({
        title: req.body.title,
        authorFirst: req.body.authorFirst,
        authorLast: req.body.authorLast,
        pages: req.body.pages,
        genre: req.body.genre,
        dateFinished: req.body.dateFinished,
        format: req.body.format,
        userId: userId
      });

      console.log('Book saved for user:', userId);
      res.redirect('/books');
  } catch (err) {
    console.error('Error saving book:', err);
    res.status(500).send('Something went wrong while saving the book.');
  }
});








// Show all books
router.get('/', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { q, genre, format, sort, page = 1 } = req.query;

    let orderBy = 'date_finished DESC, id DESC';

    if (sort === 'title') orderBy = 'title ASC';
    if (sort === '-title') orderBy = 'title DESC';
    if (sort === 'author') orderBy = 'author_last ASC, author_first ASC';
    if (sort === '-author') orderBy = 'author_last DESC, author_first DESC';
    if (sort === 'dateFinished') orderBy = 'date_finished ASC';
    if (sort === '-dateFinished') orderBy = 'date_finished DESC';

    const limit = 10;
    const offset = (page - 1) * limit;

    let where = ['user_id = $1'];
    let values = [userId];
    let index = 2;

    if (q && q.trim()) {
      where.push(`(
        title ILIKE $${index}
        OR author_first ILIKE $${index}
        OR author_last ILIKE $${index}
        OR genre ILIKE $${index}
      )`);
      values.push(`%${q}%`);
      index++;
    }

    if (genre && genre !== 'All') {
      where.push(`genre = $${index}`);
      values.push(genre);
      index++;
    }

    if (format && format !== 'All') {
      where.push(`format = $${index}`);
      values.push(format);
      index++;
    }

    const query = `
      SELECT *
      FROM books
      WHERE ${where.join(' AND ')}
      ORDER BY ${orderBy}
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const result = await pool.query(query, values);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM books WHERE ${where.join(' AND ')}`,
      values
    );

    const total = Number(countResult.rows[0].count);
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    res.render('books/index', {
      title: 'Books Read',
      items: result.rows,
      total,
      totalPages,
      page: Number(page) || 1,
      limit,
      q: q || '',
      genre: genre || 'All',
      format: format || 'All',
      sort: sort || ''
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading books');
  }
});







//Show edit form for one book
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.getBookById(req.params.id);
        if (!book) {
            return res.status(404).send('Book not found');
        }
        res.render('books/edit', { book });
    } catch (err) {
        console.error(' Error loading the edit form:', err);
        res.status(500).send('Something went wrong.');
    }
});







// Handle edit form submission
router.put('/:id', async (req, res) => {
  try {
    await Book.updateBook(req.params.id, {
      title: req.body.title,
      authorFirst: req.body.authorFirst,
      authorLast: req.body.authorLast,
      pages: req.body.pages,
      genre: req.body.genre,
      dateFinished: req.body.dateFinished,
      format: req.body.format
    });
    console.log(`✏️ Updated book with id: ${req.params.id}`);
    res.redirect('/books');
  } catch (err) {
    console.error(' Error updating book:', err);
    res.status(500).send('Something went wrong while updating.');
  }
});
  






//Delete a book
router.delete('/:id', async (req, res) => {
  try {
    await Book.deleteBook(req.params.id);
    console.log(`Deleted book with id: ${req.params.id}`);
    res.redirect('/books');
  } catch (err) {
    console.error('Error deleting book', err);
    res.status(500).send('Something went wrong while deleting the book.');
  }
});


module.exports = router;