const express = require('express');
const router = express.Router();
const Lecture = require('../models/Lecture');

// Middleware: require login (reuse your same function as books)
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}
router.use(requireLogin);

// Show form to add new lecture
router.get('/new', (req, res) => {
  res.render('lectures/new', { title: 'Add New Lecture' });
});


// Handle form submission (create new lecture)
router.post('/', async (req, res) => {
  try {
    const userId = req.session.userId;
    const newLecture = new Lecture({
      title: req.body.title,
      speakerFirst: req.body.speakerFirst,
      speakerLast: req.body.speakerLast,
      seriesTitle: req.body.seriesTitle,
      duration: req.body.duration,
      genre: req.body.genre,
      dateListened: req.body.dateListened,
      user: userId
    });
    await newLecture.save();
    console.log('✅ Lecture saved:', newLecture.title);
    res.redirect('/lectures');
  } catch (err) {
    console.error('Error saving lecture:', err);
    res.status(500).send('Something went wrong while saving the lecture.');
  }
});





// List all lectures (minimal search + filter + sort)
router.get('/', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { q, genre, sort } = req.query;

    const filter = { user: userId };

    // Search (title, speaker, series)
    if (q && q.trim()) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { speakerFirst: { $regex: q, $options: 'i' } },
        { speakerLast: { $regex: q, $options: 'i' } },
        { seriesTitle: { $regex: q, $options: 'i' } }
      ];
    }

    // Genre filter
    if (genre && genre !== 'All') {
      filter.genre = genre;
    }

    // Sorting
    let sortObj = { dateListened: -1 }; // default
    if (sort) {
      sortObj = {};
      sort.split(',').forEach(key => {
        key = key.trim();
        if (!key) return;
        if (key.startsWith('-')) sortObj[key.slice(1)] = -1;
        else sortObj[key] = 1;
      });
    }

    const lectures = await Lecture.find(filter).sort(sortObj);

    res.render('lectures/index', {
      title: 'Lectures Completed',
      lectures,
      q: q || '',
      genre: genre || 'All',
      sort: sort || 'dateListened'
    });

  } catch (err) {
    console.error('Error loading lectures:', err);
    res.status(500).send('Error loading lectures');
  }
});









// Show edit form for one lecture
router.get('/:id/edit', async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    if (!lecture) return res.status(404).send('Lecture not found');
    res.render('lectures/edit', { title: 'Edit Lecture', lecture });
  } catch (err) {
    console.error('Error loading edit form:', err);
    res.status(500).send('Something went wrong.');
  }
});

// Handle edit form submission
router.put('/:id', async (req, res) => {
  try {
    await Lecture.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      speakerFirst: req.body.speakerFirst,
      speakerLast: req.body.speakerLast,
      seriesTitle: req.body.seriesTitle,
      duration: req.body.duration,
      genre: req.body.genre,
      dateListened: req.body.dateListened
    });
    console.log(`✏️ Updated lecture with id: ${req.params.id}`);
    res.redirect('/lectures');
  } catch (err) {
    console.error('Error updating lecture:', err);
    res.status(500).send('Something went wrong while updating.');
  }
});


// Delete a lecture
router.delete('/:id', async (req, res) => {
  try {
    await Lecture.findByIdAndDelete(req.params.id);
    console.log(`🗑️ Deleted lecture with id: ${req.params.id}`);
    res.redirect('/lectures');
  } catch (err) {
    console.error('Error deleting lecture:', err);
    res.status(500).send('Something went wrong while deleting the lecture.');
  }
});






module.exports = router;
