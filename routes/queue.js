const express = require('express');
const router = express.Router();
const QueueItem = require('../models/QueueItem');

// Middleware: require login
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.redirect('/login');
  next();
}
router.use(requireLogin);

// List all queue items (with search + type filter)
router.get('/', async (req, res) => {
  const userId = req.session.userId;
  const { q, type } = req.query;

  const filter = { user: userId };

  // Text search: title, author names, speaker, series
  if (q && q.trim()) {
    filter.$or = [
      { title: { $regex: q, $options: 'i' } },
      { authorFirstName: { $regex: q, $options: 'i' } },
      { authorLastName: { $regex: q, $options: 'i' } },
      { speakerName: { $regex: q, $options: 'i' } },
      { seriesTitle: { $regex: q, $options: 'i' } }
    ];
  }

  // Filter by type (Book, Audiobook, Audio Lecture)
  if (type && type !== 'All') {
    filter.type = type;
  }

  const items = await QueueItem.find(filter).sort({ createdAt: -1 });

  res.render('queue/index', {
    title: 'My Queue',
    items,
    q: q || '',
    type: type || 'All'
  });
});


// Show add form
router.get('/new', (req, res) => {
  res.render('queue/new', { title: 'Add to Queue' });
});

// Add new item
router.post('/', async (req, res) => {
  try {
    const { type } = req.body;
    const item = {
      user: req.session.userId,
      type,
      title: req.body.title,
      genre: req.body.genre,
      own: req.body.own
    };

    if (type === 'Book') {
      item.authorFirstName = req.body.authorFirstName;
      item.authorLastName = req.body.authorLastName;
      item.pages = req.body.pages;
    } else if (type === 'Audiobook') {
      item.authorFirstName = req.body.authorFirstName;
      item.authorLastName = req.body.authorLastName;
    } else if (type === 'Audio Lecture') {
      item.speakerName = req.body.speakerName;
      item.seriesTitle = req.body.seriesTitle;
      item.duration = req.body.duration;
    }

    await new QueueItem(item).save();
    res.redirect('/queue');
  } catch (err) {
    console.error('Error adding queue item:', err);
    res.status(500).send('Error saving item.');
  }
});

// Delete item
router.delete('/:id', async (req, res) => {
  await QueueItem.findByIdAndDelete(req.params.id);
  res.redirect('/queue');
});

module.exports = router;
