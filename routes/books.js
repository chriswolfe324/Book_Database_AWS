const express = require('express');
const router = express.Router();
const Book = require('../models/Book');
const { parseSort, getPagination } = require('./utils/query');

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

    const newBook = new Book({
      title: req.body.title,
      authorFirst: req.body.authorFirst,
      authorLast: req.body.authorLast,
      pages: req.body.pages,
      genre: req.body.genre,
      dateFinished: req.body.dateFinished,
      format: req.body.format,
      user: userId, // ✅ add this line (must match your filter)
    });

    await newBook.save();
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
    const userId = req.session.userId; // or however you store it
    const { q, genre, format, sort } = req.query;
    const { page, limit, skip } = getPagination(req.query);

    const filter = { user: userId }; // ensure per-user data

    // simple search you already had — preserving it
    if (q && q.trim()) {
      filter.$or = [
        { title:   { $regex: q, $options: 'i' } },
        { authorFirst: { $regex: q, $options: 'i' } },
        { authorLast:  { $regex: q, $options: 'i' } },
        { genre:   { $regex: q, $options: 'i' } },
      ];
    }

    if (genre && genre !== 'All') filter.genre = genre;
    if (format && format !== 'All') filter.format = format;

    const sortObj = parseSort(sort);

    const [items, total] = await Promise.all([
      Book.find(filter).sort(sortObj).skip(skip).limit(limit),
      Book.countDocuments(filter)
    ]);

    console.log('Filter being used:', filter);
    console.log('Books found:', items.length);


    const totalPages = Math.max(Math.ceil(total / limit), 1);

    res.render('books/index', {
      title: 'Books Read',
      items,
      total,
      page,
      totalPages,
      limit,
      q: q || '',
      genre: genre || 'All',
      format: format || 'All',
      sort: sort || 'dateFinished,-_id', // reflect default
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading books');
  }
});







//Show edit form for one book
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
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
      await Book.findByIdAndUpdate(req.params.id, {
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
        await Book.findByIdAndDelete(req.params.id);
        console.log(`Deleted book with id: ${req.params.id}`);
        res.redirect('/books');
    } catch (err) {
        console.error ('Error deleting book', err);
        res.status(500).send('Something went wrong while deleting the book.');;
    }
});


module.exports = router;