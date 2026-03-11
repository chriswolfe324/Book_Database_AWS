const mongoose = require('mongoose');

const LectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  speakerFirst: { type: String },
  speakerLast: { type: String },
  seriesTitle: { type: String },
  duration: { type: Number }, // minutes or hours
  genre: {
    type: String,
    enum: ['Philosophy', 'History', 'Science', 'Economics', 'Music', 'Literature', 'Other']
  },
  dateListened: { type: Date },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Lecture', LectureSchema);
