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
  }]
});
quizSchema.index({ quizCode: 1 }, { unique: true });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;