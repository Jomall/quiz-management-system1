const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
    required: true
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: String,
  points: {
    type: Number,
    default: 1
  },
  explanation: String
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questions: [questionSchema],
  settings: {
    timeLimit: { type: Number, default: 0 }, // 0 means no time limit
    attemptsAllowed: { type: Number, default: 1 },
    shuffleQuestions: { type: Boolean, default: false },
    showCorrectAnswers: { type: Boolean, default: true },
    passingScore: { type: Number, default: 70 }
  },
  assignedTo: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date, default: Date.now },
    dueDate: Date,
    completed: { type: Boolean, default: false }
  }],
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    answers: [{
      questionId: mongoose.Schema.Types.ObjectId,
      answer: String,
      isCorrect: Boolean,
      pointsEarned: Number
    }],
    score: Number,
    startedAt: Date,
    completedAt: Date,
    timeSpent: Number
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
