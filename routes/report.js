const express = require('express');
const router = express.Router();

// temporary placeholder route
router.get('/reading-history', (req, res) => {
  res.send('Reading history report request received.');
});

module.exports = router;