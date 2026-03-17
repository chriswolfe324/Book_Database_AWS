const express = require('express');
const router = express.Router();

router.post('/reading-history', (req, res) => {
  const { reportType } = req.body;

  console.log("Report type:", reportType);
  console.log("User:", req.session.userId);
  
  res.send('Reading history report job started.');
});

module.exports = router;