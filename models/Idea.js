const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  shortDescription: { type: String, required: true },
  detailedDescription: { type: String, required: true },
  category: {
    type: String,
    required: true,
    enum: ['Tech', 'Health', 'AI', 'Education', 'Finance', 'Environment', 'Food', 'Travel', 'Entertainment', 'Other']
  },
  tags: [{ type: String, trim: true }],
  imageURL: { type: String, default: '' },
  estimatedBudget: { type: String, default: '' },
  targetAudience: { type: String, required: true },
  problemStatement: { type: String, required: true },
  proposedSolution: { type: String, required: true },
  authorId: { type: String, required: true },
  authorName: { type: String, required: true },
  authorEmail: { type: String, required: true },
  authorPhoto: { type: String, default: '' },
  commentCount: { type: Number, default: 0 },
  bookmarks: [{ type: String }], // array of user emails who bookmarked
}, { timestamps: true });

module.exports = mongoose.model('Idea', ideaSchema);
