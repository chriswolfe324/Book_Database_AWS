const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String },
    authorFirst: { type: String },
    authorLast: { type: String },
    pages: { type: Number },
    genre: { 
        type: String,
        enum: ['Fiction', 'Economics', 'Philosophy', 'History', 'Science', 'Music', 'Other']
    },
    dateFinished: { type: Date },
    format: { type: String, enum: ['AudioBook', 'Book'], default: 'AudioBook'},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true});



// After schema definition:
bookSchema.index({ user: 1, title: 1 });
bookSchema.index({ user: 1, authorLast: 1, authorFirst: 1 });
bookSchema.index({ user: 1, genre: 1 });
bookSchema.index({ user: 1, dateFinished: -1 });




module.exports = mongoose.model('Book', bookSchema);