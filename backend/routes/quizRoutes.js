const express = require('express');
const router = express.Router();
const { generateQuiz, generateQuizFromPDF } = require('../controllers/quizController');

router.post('/generate-quiz', generateQuiz);
router.post('/generate-quiz-from-pdf', generateQuizFromPDF);

module.exports = router;