const mongoose = require('mongoose');

const queueItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // ✅ add this line
  type: {
    type: String,
    required: true,
    enum: ['Book', 'Audiobook', 'Audio Lecture']
  },
  title: { type: String, required: true },

  // Shared fields
  genre: String,
  own: String,

  // Book / Audiobook fields
  authorFirstName: String,
  authorLastName: String,
  pages: Number,       // only for books
  duration: Number,    // only for lectures

  // Audio Lecture fields
  speakerName: String,
  seriesTitle: String,

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('QueueItem', queueItemSchema);
