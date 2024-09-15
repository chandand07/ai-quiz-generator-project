const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require('node-fetch');
const multer = require('multer');
const fs = require('fs');
const Quiz = require('../models/Quiz');
const User = require('../models/User'); 
const Result = require('../models/Result');


global.fetch = fetch;
global.Headers = fetch.Headers;

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const upload = multer({ dest: 'uploads/' });

exports.generateQuiz = async (req, res) => {
  try {
    const { numberOfQuestions, difficultyLevel, testDuration, prompt } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(
      `Generate exactly ${numberOfQuestions} multiple-choice questions with difficulty level ${difficultyLevel} for a ${testDuration}-minute test based on the following prompt: ${prompt}\n\nFormat each question as a JSON object with the following structure:\n{\n  "question": "Question text",\n  "options": ["Option A", "Option B", "Option C", "Option D"],\n  "correctOption": 0 // Index of the correct option (0-3)\n}\n\nProvide the questions as a JSON array without any markdown formatting or code blocks. Do not generate more or less than ${numberOfQuestions} questions.`
    );

    const rawResponse = result.response.text();
    const cleanedResponse = rawResponse.replace(/```json\n?|\n?```/g, '').trim();
    let generatedQuestions = JSON.parse(cleanedResponse);

    
    if (generatedQuestions.length > parseInt(numberOfQuestions)) {
      generatedQuestions = generatedQuestions.slice(0, parseInt(numberOfQuestions));
    } else if (generatedQuestions.length < parseInt(numberOfQuestions)) {
      while (generatedQuestions.length < parseInt(numberOfQuestions)) {
        generatedQuestions.push({
          question: "Placeholder question",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctOption: 0
        });
      }
    }

    res.json({ questions: generatedQuestions });
  } catch (error) {
    console.error('Error in generateQuiz:', error);
    res.status(500).json({ message: 'Failed to generate quiz', error: error.toString() });
  }
};

exports.generateQuizFromPDF = [
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const { numberOfQuestions, difficultyLevel, testDuration } = req.body;
      const pdfContent = fs.readFileSync(req.file.path, { encoding: 'base64' });

      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

      const result = await model.generateContent([
        `Generate ${numberOfQuestions} multiple-choice questions with difficulty level ${difficultyLevel} for a ${testDuration}-minute test based on the content of this PDF. Format each question as a JSON object with the following structure: { 'question': 'Question text', 'options': ['Option A', 'Option B', 'Option C', 'Option D'], 'correctOption': 0 } Provide the questions as a JSON array without any markdown formatting or code blocks.`,
        {
          inlineData: {
            mimeType: "application/pdf",
            data: pdfContent
          }
        }
      ]);

      const rawResponse = result.response.text();
      const cleanedResponse = rawResponse.replace(/```json\n?|\n?```/g, '').trim();
      let generatedQuestions = JSON.parse(cleanedResponse);

      
      generatedQuestions = generatedQuestions.slice(0, parseInt(numberOfQuestions));

      
      fs.unlinkSync(req.file.path);

      res.json({ questions: generatedQuestions });
    } catch (error) {
      console.error('Error generating quiz from PDF:', error);
      res.status(500).json({ message: 'Failed to generate quiz from PDF', error: error.toString() });
    }
  }
];

exports.createQuizDetails = async (req, res) => {
  try {
    console.log('Received quiz details:', req.body);
    const { quizCode, subject, testDate, testTime, testDuration, class: quizClass, section } = req.body;
    const quiz = await Quiz.create({
      quizCode,
      subject,
      testDate,
      testTime,
      testDuration: parseInt(testDuration),
      class: parseInt(quizClass), 
      section,
      creator: req.user._id
    });
    console.log('Created quiz:', quiz);
    res.status(201).json({
      status: 'success',
      quizId: quiz._id
    });
  } catch (error) {
    console.error('Error in createQuizDetails:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message,
      details: error.errors ? Object.values(error.errors).map(e => e.message) : null
    });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const { quizId, questions } = req.body;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        status: 'fail',
        message: 'Quiz not found'
      });
    }
    if (quiz.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'fail',
        message: 'You are not authorized to modify this quiz'
      });
    }
    quiz.questions = questions;
    await quiz.save();
    res.status(200).json({
      status: 'success',
      message: 'Quiz created successfully'
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

exports.getEducatorQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ creator: req.user._id })
      .select('quizCode subject testDate testTime testDuration class section')
      .sort({ testDate: 1, testTime: 1 });

    res.status(200).json({
      status: 'success',
      quizzes
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};


exports.verifyQuizCode = async (req, res) => {
  try {
    const { quizCode, quizId } = req.body;
    const studentId = req.user._id;

    let query = { quizCode };
    if (quizId) {
      query._id = quizId;
    }

    const quiz = await Quiz.findOne(query);

    if (!quiz) {
      return res.status(404).json({ status: 'error', message: 'Quiz not found' });
    }

    
    if (quiz.class !== req.user.class || quiz.section !== req.user.section) {
      return res.status(403).json({ status: 'error', message: 'You are not authorized to take this quiz' });
    }

    
    if (quiz.attemptedBy.includes(studentId)) {
      return res.status(400).json({ status: 'error', message: 'You have already attempted this quiz' });
    }

    
    const now = new Date();
    const quizStartTime = new Date(`${quiz.testDate}T${quiz.testTime}`);
    const quizEndTime = new Date(quizStartTime.getTime() + quiz.testDuration * 60000);

    if (now < quizStartTime) {
      return res.status(400).json({ status: 'error', message: 'The quiz has not started yet' });
    }

    if (now > quizEndTime) {
      return res.status(400).json({ status: 'error', message: 'The quiz has already ended' });
    }

    res.json({ status: 'success', quiz: quiz });
  } catch (error) {
    console.error('Error verifying quiz code:', error);
    res.status(500).json({ status: 'error', message: 'Failed to verify quiz code' });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    const studentId = req.user._id;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ status: 'error', message: 'Quiz not found' });
    }


    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++;
      }
    });

    
    const result = await Result.create({
      student: studentId,
      quiz: quizId,
      score: score,
      totalQuestions: quiz.questions.length,
      answers: answers
    });

    
    await Quiz.findByIdAndUpdate(quizId, { $addToSet: { attemptedBy: studentId } });

    res.json({ 
      status: 'success', 
      message: 'Quiz submitted successfully', 
      score: score, 
      totalQuestions: quiz.questions.length 
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ status: 'error', message: 'Failed to submit quiz' });
  }
};

exports.getStudentQuizResults = async (req, res) => {
  try {
    const studentId = req.user._id;
    const results = await Result.find({ student: studentId })
      .populate('quiz', 'subject testDate testTime')
      .sort({ submittedAt: -1 });

    const formattedResults = results.map(result => ({
      _id: result._id,
      subject: result.quiz.subject,
      testDate: result.quiz.testDate,
      testTime: result.quiz.testTime,
      score: result.score,
      totalQuestions: result.totalQuestions,
      submittedAt: result.submittedAt
    }));

    res.json({ status: 'success', results: formattedResults });
  } catch (error) {
    console.error('Error fetching student quiz results:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch quiz results' });
  }
};

exports.getStudentQuizzes = async (req, res) => {
  try {
    const studentId = req.user._id;
    const now = new Date();

    const quizzes = await Quiz.find({
      class: req.user.class,
      section: req.user.section,
      attemptedBy: { $ne: studentId },
      $or: [
        { testDate: { $gt: now } },
        {
          testDate: { $eq: now.toISOString().split('T')[0] },
          testTime: { $gte: now.toTimeString().split(' ')[0] }
        }
      ]
    }).lean();

    const processedQuizzes = quizzes.map(quiz => {
      const quizEndTime = new Date(quiz.testDate);
      const [hours, minutes] = quiz.testTime.split(':');
      quizEndTime.setHours(parseInt(hours, 10), parseInt(minutes, 10) + quiz.testDuration);

      return {
        ...quiz,
        ended: quizEndTime < now
      };
    });

    res.json({ status: 'success', quizzes: processedQuizzes });
  } catch (error) {
    console.error('Error fetching student quizzes:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch quizzes' });
  }
};

exports.getQuizResults = async (req, res) => {
  try {
    const { quizId } = req.params;
    const results = await Result.find({ quiz: quizId })
      .populate('student', 'name')
      .populate('quiz', 'subject');

    const formattedResults = results.map(result => ({
      _id: result._id,
      studentName: result.student.name,
      subject: result.quiz.subject,
      score: result.score,
      totalQuestions: result.totalQuestions
    }));

    res.json({ status: 'success', results: formattedResults });
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch quiz results' });
  }
};