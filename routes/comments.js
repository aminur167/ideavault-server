const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Idea = require('../models/Idea');
const verifyToken = require('../middleware/verifyToken');

// GET /api/comments/:ideaId
router.get('/:ideaId', async (req, res) => {
  try {
    const comments = await Comment.find({ ideaId: req.params.ideaId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/comments
router.post('/', verifyToken, async (req, res) => {
  try {
    const { ideaId, text } = req.body;
    if (!ideaId || !text) return res.status(400).json({ message: 'ideaId and text are required' });
    const comment = new Comment({
      ideaId,
      text,
      authorId: req.user.email,
      authorEmail: req.user.email,
      authorName: req.user.name || 'Anonymous',
      authorPhoto: req.user.photo || '',
    });
    const saved = await comment.save();
    // Increment comment count on idea
    await Idea.findByIdAndUpdate(ideaId, { $inc: { commentCount: 1 } });
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/comments/:id
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.authorEmail !== req.user.email)
      return res.status(403).json({ message: 'Forbidden: Not your comment' });
    comment.text = req.body.text || comment.text;
    const updated = await comment.save();
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/comments/:id
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.authorEmail !== req.user.email)
      return res.status(403).json({ message: 'Forbidden: Not your comment' });
    await Comment.findByIdAndDelete(req.params.id);
    await Idea.findByIdAndUpdate(comment.ideaId, { $inc: { commentCount: -1 } });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
