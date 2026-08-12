const express = require('express');
const router = express.Router();
const Idea = require('../models/Idea');
const Comment = require('../models/Comment');
const verifyToken = require('../middleware/verifyToken');

// GET /api/ideas - all ideas with search & filter
router.get('/', async (req, res) => {
  try {
    const { search, category, startDate, endDate, page = 1, limit = 12 } = req.query;
    const query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category && category !== 'All') query.category = category;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Idea.countDocuments(query);
    const ideas = await Idea.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    res.json({ ideas, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/ideas/trending - top 6 by comment count
router.get('/trending', async (req, res) => {
  try {
    const ideas = await Idea.aggregate([
      { $sort: { commentCount: -1, createdAt: -1 } },
      { $limit: 6 }
    ]);
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/ideas/my - logged-in user's ideas
router.get('/my', verifyToken, async (req, res) => {
  try {
    const ideas = await Idea.find({ authorEmail: req.user.email }).sort({ createdAt: -1 });
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/ideas/:id - single idea
router.get('/:id', async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    res.json(idea);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ideas - create idea (protected)
router.post('/', verifyToken, async (req, res) => {
  try {
    const idea = new Idea({ ...req.body, authorEmail: req.user.email });
    const saved = await idea.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/ideas/:id - update idea (owner only)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    if (idea.authorEmail !== req.user.email)
      return res.status(403).json({ message: 'Forbidden: Not your idea' });
    const updated = await Idea.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/ideas/:id - delete idea (owner only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    if (idea.authorEmail !== req.user.email)
      return res.status(403).json({ message: 'Forbidden: Not your idea' });
    await Idea.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ ideaId: req.params.id });
    res.json({ message: 'Idea deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/ideas/:id/bookmark - toggle bookmark
router.post('/:id/bookmark', verifyToken, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) return res.status(404).json({ message: 'Idea not found' });
    const email = req.user.email;
    const idx = idea.bookmarks.indexOf(email);
    if (idx === -1) {
      idea.bookmarks.push(email);
    } else {
      idea.bookmarks.splice(idx, 1);
    }
    await idea.save();
    res.json({ bookmarked: idx === -1, bookmarkCount: idea.bookmarks.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
