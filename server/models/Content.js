const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['video', 'document', 'note', 'audio', 'image'],
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAt: { type: Date, default: Date.now },
    viewed: { type: Boolean, default: false },
    viewedAt: Date
  }],
  tags: [String],
  category: {
    type: String,
    enum: ['lesson', 'assignment', 'resource', 'announcement'],
    default: 'resource'
  },
  metadata: {
    duration: Number, // for videos/audio
    pages: Number, // for documents
    dimensions: {
      width: Number,
      height: Number
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Content', contentSchema);
