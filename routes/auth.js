const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// POST /api/auth/jwt - generate JWT token for a user
router.post('/jwt', (req, res) => {
  const { email, name, photo } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const token = jwt.sign(
    { email, name, photo },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token });
});

module.exports = router;
