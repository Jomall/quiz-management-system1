const express = require('express');
const Content = require('../models/Content');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// Create content
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, type, url, content } = req.query;

    // Check if user is an instructor
    const user = await User.findById(req.user.userId);
    if (user.role !== 'instructor') {
      return res.status(403).json({ message: 'Only instructors can create content' });
    }

    const newContent = new Content({
      title,
      description,
      type,
      url,
      content,
      instructorId: req.user.userId
    });

    await newContent.save();

    res.status(201).json({
      message: 'Content created successfully',
      content: newContent
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all content
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    let query = {};

    if (user.role === 'student') {
      // Get content from student's instructors
      const User = require('../models/User');
      const instructor = await User.findById(req.query.instructorId);
      if (!instructor || instructor.role !== 'instructor') {
        return res.status(400).json({ message: 'Invalid instructor ID' });
      }
      query = { instructorId: req.query.instructorId };
    } else {
      // Get instructor's own content
      query = { instructorId: req.user.userId };
    }

    const content = await Content.find(query)
      .populate('instructorId', 'username')
      .sort({ createdAt: -1 });

    res.json(content);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get content by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id)
      .populate('instructorId', 'username');

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.json(content);
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update content
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, type, url, content } = req.query;

    const existingContent = await Content.findById(req.params.id);
    if (!existingContent) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if user is the instructor who created the content
    if (existingContent.instructorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the instructor who created the content can update it' });
    }

    // Update content
    existingContent.title = title || existingContent.title;
    existingContent.description = description || existingContent.description;
    existingContent.type = type || existingContent.type;
    existingContent.url = url || existingContent.url;
    existingContent.content = content || existingContent.content;

    await existingContent.save();

    res.json({
      message: 'Content updated successfully',
      content: existingContent
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete content
router.delete('/:id', auth, async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if user is the instructor who created the content
    if (content.instructorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the instructor who created the content can delete it' });
    }

    await Content.findByIdAndDelete(req.params.id);

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
