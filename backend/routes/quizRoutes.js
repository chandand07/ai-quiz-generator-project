const express = require('express');
const router = express.Router();
const { generateQuiz, generateQuizFromPDF } = require('../controllers/quizController');
const quizController = require('../controllers/quizController');
const authController = require('../controllers/authController');

router.post('/generate-quiz', generateQuiz);
router.post('/generate-quiz-from-pdf', generateQuizFromPDF);
router.post('/quiz/details', authController.protect, authController.restrictTo('educator'), quizController.createQuizDetails);
router.post('/quiz/create', authController.protect, authController.restrictTo('educator'), quizController.createQuiz);
router.get('/quizzes', authController.protect, authController.restrictTo('educator'), quizController.getEducatorQuizzes);

module.exports = router;