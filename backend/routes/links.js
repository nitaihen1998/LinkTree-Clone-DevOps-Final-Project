const express = require('express');
const Link = require('../models/Link');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new link
router.post('/', verifyToken, async (req, res) => {
  const { title, url } = req.body;
  try {
    // Get the highest order value for this user
    const highestOrder = await Link.findOne({ user: req.user.id }).sort({ order: -1 });
    const newOrder = highestOrder ? highestOrder.order + 1 : 0;

    const link = new Link({ user: req.user.id, title, url, order: newOrder });
    await link.save();
    res.status(201).json(link);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all links for a user (sorted by order)
router.get('/', verifyToken, async (req, res) => {
  try {
    const links = await Link.find({ user: req.user.id }).sort({ order: 1 });
    res.json(links);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a link
router.put('/:id', verifyToken, async (req, res) => {
  const { title, url } = req.body;
  try {
    const link = await Link.findById(req.params.id);
    if (!link) return res.status(404).json({ error: 'Link not found' });

    if (link.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    link.title = title || link.title;
    link.url = url || link.url;
    link.updatedAt = new Date();
    await link.save();
    res.json(link);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle link visibility (hide/show)
router.patch('/:id/toggle-visibility', verifyToken, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) return res.status(404).json({ error: 'Link not found' });

    if (link.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    link.visible = !link.visible;
    link.updatedAt = new Date();
    await link.save();
    res.json(link);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reorder links (drag and drop)
router.post('/reorder', verifyToken, async (req, res) => {
  const { linkIds } = req.body;
  try {
    // Verify all links belong to the user
    const links = await Link.find({ _id: { $in: linkIds }, user: req.user.id });
    if (links.length !== linkIds.length) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Update order for each link
    const updatePromises = linkIds.map((id, index) =>
      Link.findByIdAndUpdate(id, { order: index, updatedAt: new Date() }, { new: true })
    );

    const updatedLinks = await Promise.all(updatePromises);
    res.json(updatedLinks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a link
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const link = await Link.findById(req.params.id);
    if (!link) return res.status(404).json({ error: 'Link not found' });

    if (link.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Link.findByIdAndDelete(req.params.id);
    res.json({ message: 'Link deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;