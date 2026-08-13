const express = require('express');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');
const Idea = require('../models/Idea');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { verifyFirebaseIdToken } = require('../firebaseAdmin');
const router = express.Router();

// POST /api/auth/jwt - generate JWT token for a user
router.post('/jwt', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(401).json({ message: 'Firebase ID token is required' });

  let firebaseUser;
  try {
    firebaseUser = await verifyFirebaseIdToken(idToken);
  } catch (error) {
    const message = error.message === 'Firebase Admin is not configured'
      ? 'Server authentication is not configured'
      : 'Invalid or expired Firebase session';
    return res.status(401).json({ message });
  }

  const email = firebaseUser.email;
  const firebaseUid = firebaseUser.uid;
  const name = firebaseUser.name || 'Anonymous';
  const photo = firebaseUser.picture || '';
  const provider = firebaseUser.firebase?.sign_in_provider || 'password';
  if (!email) return res.status(400).json({ message: 'A verified email address is required' });

  try {
    await User.findOneAndUpdate(
      { firebaseUid },
      {
        $set: {
          email: email.toLowerCase(),
          name: typeof name === 'string' && name.trim() ? name.trim() : 'Anonymous',
          photo: typeof photo === 'string' ? photo.trim() : '',
          provider: typeof provider === 'string' ? provider : 'password',
          lastLoginAt: new Date(),
        },
        $setOnInsert: { firebaseUid },
      },
      { new: true, upsert: true, runValidators: true },
    );
  } catch (error) {
    return res.status(500).json({ message: 'Could not synchronize user profile' });
  }

  const token = jwt.sign(
    { email: email.toLowerCase(), name, photo, firebaseUid },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token });
});

// Update public author details stored with existing content.
router.patch('/profile', verifyToken, async (req, res) => {
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  const photo = typeof req.body.photo === 'string' ? req.body.photo.trim() : '';
  if (!name || name.length > 80) return res.status(400).json({ message: 'A valid name is required' });
  if (photo.length > 500) return res.status(400).json({ message: 'Photo URL is too long' });
  try {
    const filter = { authorEmail: req.user.email };
    await Promise.all([
      Idea.updateMany(filter, { $set: { authorName: name, authorPhoto: photo } }),
      Comment.updateMany(filter, { $set: { authorName: name, authorPhoto: photo } }),
      User.updateOne({ firebaseUid: req.user.firebaseUid }, { $set: { name, photo } }),
    ]);
    res.json({ name, photo });
  } catch {
    res.status(500).json({ message: 'Could not update profile details' });
  }
});

module.exports = router;
