require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDatabase = require('./db');
const Idea = require('./models/Idea');
const Comment = require('./models/Comment');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const ideaRoutes = require('./routes/ideas');
const commentRoutes = require('./routes/comments');
const interactionRoutes = require('./routes/interactions');

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch {
    res.status(503).json({ message: 'Database is temporarily unavailable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/ideas', ideaRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/interactions', interactionRoutes);

app.get('/', (req, res) => res.json({ message: 'IdeaVault API is running' }));
app.get('/api/stats', async (req, res) => {
  try {
    const [ideaCount, commentCount, creatorCount] = await Promise.all([
      Idea.countDocuments(),
      Comment.countDocuments(),
      User.countDocuments(),
    ]);
    res.json({ ideaCount, commentCount, creatorCount });
  } catch {
    res.status(500).json({ message: 'Could not load platform statistics' });
  }
});

app.use((error, req, res, next) => {
  if (error.message === 'Origin is not allowed by CORS') {
    return res.status(403).json({ message: 'This website is not allowed to access the API' });
  }
  console.error(error);
  return res.status(500).json({ message: 'An unexpected server error occurred' });
});

if (require.main === module) {
  connectDatabase()
    .then(() => app.listen(PORT, () => console.log(`IdeaVault server running on port ${PORT}`)))
    .catch((error) => {
      console.error('MongoDB connection failed:', error.message);
      process.exit(1);
    });
}

module.exports = app;
