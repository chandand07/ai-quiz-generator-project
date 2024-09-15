const express = require('express');
const router = express.Router();
const { generateQuiz, generateQuizFromPDF } = require('../controllers/quizController');
const quizController = require('../controllers/quizController');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');



router.post('/generate-quiz', generateQuiz);
router.post('/generate-quiz-from-pdf', generateQuizFromPDF);
router.post('/quiz/details', authController.protect, authController.restrictTo('educator'), quizController.createQuizDetails);
router.post('/quiz/create', authController.protect, authController.restrictTo('educator'), quizController.createQuiz);
router.get('/quizzes', authController.protect, authController.restrictTo('educator'), quizController.getEducatorQuizzes);
router.get('/quiz/student-quizzes', authController.protect, quizController.getStudentQuizzes);
router.post('/verify-code', authController.protect, quizController.verifyQuizCode);
router.post('/submit', authController.protect, quizController.submitQuiz);
router.get('/quiz-results', authController.protect, quizController.getQuizResults);
router.get('/:quizId/results', authController.protect, quizController.getQuizResults);
router.get('/student-quiz-results', authController.protect, quizController.getStudentQuizResults);
module.exports = router;