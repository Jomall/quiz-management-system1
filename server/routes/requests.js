const express = require('express');
const Request = require('../models/Request');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Send request
router.post('/', auth, async (req, res) => {
  try {
    const { instructorId } = req.query;

    // Check if user is a student
    const student = await User.findById(req.user.userId);
    if (student.role !== 'student') {
      return res.status(403).json({ message: 'Only students can send requests' });
    }

    // Check if instructor exists
    const instructor = await User.findById(instructorId);
    if (!instructor || instructor.role !== 'instructor') {
      return res.status(400).json({ message: 'Invalid instructor ID' });
    }

    // Check if request already exists
    const existingRequest = await Request.findOne({
      student: req.user.userId,
      instructor: instructorId
    });

    if (existingRequest) {
      return res.status(400).json({ message: 'Request already sent' });
    }

    const request = new Request({
      student: req.user.userId,
      instructor: instructorId
    });

    await request.save();

    // Populate the request
    await request.populate('student instructor', 'username email');

    res.status(201).json({
      message: 'Request sent successfully',
      request
    });
  } catch (error) {
    console.error('Send request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get received requests (instructor)
router.get('/received', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'instructor') {
      return res.status(403).json({ message: 'Only instructors can view received requests' });
    }

    const requests = await Request.find({ instructor: req.user.userId })
      .populate('student', 'username email profile')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get received requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sent requests (student)
router.get('/sent', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view sent requests' });
    }

    const requests = await Request.find({ student: req.user.userId })
      .populate('instructor', 'username email profile')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept request
router.put('/:id/accept', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('student instructor');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user is the instructor
    if (request.instructor._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the instructor can accept this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    request.status = 'accepted';
    await request.save();

    // Add student to instructor's students array
    const instructor = await User.findById(request.instructor._id);
    if (!instructor.students.includes(request.student._id)) {
      instructor.students.push(request.student._id);
      await instructor.save();
    }

    // Add instructor to student's instructors array
    const student = await User.findById(request.student._id);
    if (!student.instructors.includes(request.instructor._id)) {
      student.instructors.push(request.instructor._id);
      await student.save();
    }

    res.json({
      message: 'Request accepted successfully',
      request
    });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject request
router.put('/:id/reject', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user is the instructor
    if (request.instructor.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the instructor can reject this request' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is not pending' });
    }

    request.status = 'rejected';
    await request.save();

    res.json({
      message: 'Request rejected successfully',
      request
    });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel request
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Check if user is the student who sent the request
    if (request.student.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the student who sent the request can cancel it' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Cannot cancel non-pending request' });
    }

    await Request.findByIdAndDelete(req.params.id);

    res.json({ message: 'Request cancelled successfully' });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
