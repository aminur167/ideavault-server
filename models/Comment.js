const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  ideaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Idea', required: true },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorEmail: { type: String, required: true },
  authorPhoto: { type: String, default: '' },
  text: { type: String, required: true, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
