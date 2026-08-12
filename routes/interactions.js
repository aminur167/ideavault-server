const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Idea = require('../models/Idea');
const verifyToken = require('../middleware/verifyToken');

// GET /api/interactions/mine - ideas the logged-in user has commented on
router.get('/mine', verifyToken, async (req, res) => {
  try {
    // Get distinct ideaIds commented by user
    const comments = await Comment.find({ authorEmail: req.user.email })
      .sort({ createdAt: -1 });

    const ideaIdSet = [...new Set(comments.map(c => c.ideaId.toString()))];
    const ideas = await Idea.find({ _id: { $in: ideaIdSet } });

    // Attach user's comments to each idea
    const result = ideas.map(idea => {
      const userComments = comments.filter(c => c.ideaId.toString() === idea._id.toString());
      return { idea, userComments };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/interactions/bookmarks - ideas bookmarked by the logged-in user
router.get('/bookmarks', verifyToken, async (req, res) => {
  try {
    const ideas = await Idea.find({ bookmarks: req.user.email }).sort({ createdAt: -1 });
    res.json(ideas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
