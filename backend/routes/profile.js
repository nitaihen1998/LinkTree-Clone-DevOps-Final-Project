const express = require('express');
const User = require('../models/User');
const Link = require('../models/Link');

const router = express.Router();

// Get public profile by username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Only fetch visible links, sorted by order
    const links = await Link.find({ user: user._id, visible: true }).sort({ order: 1 });
    res.json({ username: user.username, bio: user.bio || '', links });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
