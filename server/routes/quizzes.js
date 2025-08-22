const express = require('express');
const Quiz = require('../models/Quiz');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Content = require('../models/Content');
const Request = require('../models/Request');

const router = express.Router();

// Create quiz
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, questions, settings, contentId } = req.body;

    // Check if user is an instructor
    const user = await User.findById(req.user.userId);
    if (user.role !== 'instructor') {
      return res.status(403).json({ message: 'Only instructors can create quizzes' });
    }

    // Check if content exists
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Create quiz
    const quiz = new Quiz({
      title,
      description,
      questions,
      settings: settings || {
        timeLimit: 0,
        attemptsAllowed: 1,
        shuffleQuestions: false,
        showCorrectAnswers: true,
        passingScore: 70
      },
      instructor: req.user.userId,
      contentId
    });

    await quiz.save();

    // Populate quiz with content and instructor
    await quiz.populate('contentId instructor', 'title username');

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all quizzes
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    let query = {};

    if (user.role === 'student') {
      // Get quizzes for student's instructors
      const requests = await Request.find({
        student: req.user.userId,
        status: 'accepted'
      }).select('instructor');

      const instructorIds = requests.map(r => r.instructor);
      query = { instructor: { $in: instructorIds } };
    } else {
      // Get instructor's own quizzes
      query = { instructor: req.user.userId };
    }

    const quizzes = await Quiz.find(query)
      .populate('contentId', 'title')
      .populate('instructor', 'username')
      .sort({ createdAt: -1 });

    res.json(quizzes);
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get quiz by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('contentId')
      .populate('instructor', 'username');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update quiz
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, questions, settings } = req.body;

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user is the instructor who created the quiz
    if (quiz.instructor.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the instructor who created the quiz can update it' });
    }

    // Update quiz
    quiz.title = title || quiz.title;
    quiz.description = description || quiz.description;
    quiz.questions = questions || quiz.questions;
    quiz.settings = { ...quiz.settings, ...settings };

    await quiz.save();

    res.json({
      message: 'Quiz updated successfully',
      quiz
    });
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete quiz
router.delete('/:id', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user is the instructor who created the quiz
    if (quiz.instructor.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the instructor who created the quiz can delete it' });
    }

    await Quiz.findByIdAndDelete(req.params.id);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit quiz
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers, timeSpent } = req.body;

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user is a student
    const user = await User.findById(req.user.userId);
    if (user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit quizzes' });
    }

    // Check if student is assigned to the instructor
    const request = await Request.findOne({
      student: req.user.userId,
      instructor: quiz.instructor,
      status: 'accepted'
    });

    if (!request) {
      return res.status(403).json({ message: 'You are not authorized to take this quiz' });
    }

    // Calculate score
    let score = 0;
    const answerDetails = [];

    quiz.questions.forEach((question, index) => {
      const studentAnswer = answers[index];
      const isCorrect = question.correctAnswer === studentAnswer;
      
      if (isCorrect) {
        score += question.points || 1;
      }

      answerDetails.push({
        questionId: question._id,
        answer: studentAnswer,
        isCorrect,
        pointsEarned: isCorrect ? (question.points || 1) : 0
      });
    });

    // Save submission
    const submission = {
      student: req.user.userId,
      answers: answerDetails,
      score,
      startedAt: new Date(), // This should be set when quiz starts
      completedAt: new Date(),
      timeSpent: timeSpent || 0
    };

    quiz.submissions.push(submission);
    await quiz.save();

    res.json({
      message: 'Quiz submitted successfully',
      score,
      total: quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0),
      maxScore: quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0)
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get quiz submissions
router.get('/:id/submissions', auth, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('submissions.student', 'username email');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if user is the instructor who created the quiz
    if (quiz.instructor.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the instructor who created the quiz can view submissions' });
    }

    res.json(quiz.submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student progress
router.get('/student-progress', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can view their progress' });
    }

    // Get all quizzes for student's instructors
    const requests = await Request.find({
      student: req.user.userId,
      status: 'accepted'
    }).select('instructor');

    const instructorIds = requests.map(r => r.instructor);
    
    const quizzes = await Quiz.find({ instructor: { $in: instructorIds } })
      .populate('contentId', 'title')
      .sort({ createdAt: -1 });

    // Calculate progress for each quiz
    const quizProgress = quizzes.map(quiz => {
      const submission = quiz.submissions.find(s => s.student.toString() === req.user.userId);
      const assignment = quiz.assignedTo.find(a => a.student.toString() === req.user.userId);
      
      const totalQuestions = quiz.questions.length;
      const completedQuestions = submission ? totalQuestions : 0;
      const score = submission ? submission.score : null;
      const maxScore = quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0);
      const status = submission ? 'completed' : 'not-started';
      const startedAt = submission ? submission.startedAt : null;
      const completedAt = submission ? submission.completedAt : null;
      const timeSpent = submission ? (submission.timeSpent || 0) : 0;
      const attempts = submission ? 1 : 0;
      const maxAttempts = quiz.settings.attemptsAllowed || 1;
      const dueDate = assignment ? assignment.dueDate : null;

      return {
        quizId: quiz._id,
        title: quiz.title,
        description: quiz.description,
        totalQuestions,
        completedQuestions,
        score,
        maxScore,
        status,
        startedAt,
        completedAt,
        dueDate,
        timeSpent,
        attempts,
        maxAttempts
      };
    });

    // Calculate student stats
    const completedQuizzes = quizProgress.filter(q => q.status === 'completed');
    const averageScore = completedQuizzes.length > 0 
      ? completedQuizzes.reduce((sum, q) => sum + (q.score || 0), 0) / completedQuizzes.length
      : 0;
    const totalTimeSpent = quizProgress.reduce((sum, q) => sum + q.timeSpent, 0);
    const upcomingQuizzes = quizProgress.filter(q => 
      q.status === 'not-started' && q.dueDate && new Date(q.dueDate) > new Date()
    ).length;
    const overdueQuizzes = quizProgress.filter(q => 
      q.status === 'not-started' && q.dueDate && new Date(q.dueDate) < new Date()
    ).length;

    const studentStats = {
      totalQuizzes: quizProgress.length,
      completedQuizzes: completedQuizzes.length,
      averageScore: Math.round(averageScore * 100) / 100,
      totalTimeSpent,
      upcomingQuizzes,
      overdueQuizzes
    };

    res.json({
      quizProgress,
      stats: studentStats
    });
  } catch (error) {
    console.error('Get student progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
