const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  quizCode: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  testDate: { type: Date, required: true },
  testTime: { type: String, required: true },
  testDuration: { type: Number, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  questions: [{
    question: String,
    options: [String],
    correctAnswer: String
  }],
  class: { 
    type: Number, 
    required: true,
    min: 4,
    max: 12
  },
  section: { 
    type: String, 
    required: true,
    enum: ['A', 'B', 'C', 'D']
  },
  attemptedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});
quizSchema.index({ quizCode: 1 }, { unique: true });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;