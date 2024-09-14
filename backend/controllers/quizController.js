const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require('node-fetch');
const multer = require('multer');
const fs = require('fs');
const Quiz = require('../models/Quiz');
const User = require('../models/User'); // Add this line
const Result = require('../models/Result');


global.fetch = fetch;
global.Headers = fetch.Headers;

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const upload = multer({ dest: 'uploads/' });

exports.generateQuiz = async (req, res) => {
    try {
      const { prompt } = req.body;
      console.log('Received prompt:', prompt);
  
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
      console.log('Sending request to Gemini API');
      const result = await model.generateContent(
        `Generate 15 multiple-choice questions based on the following prompt: ${prompt}\n\nFormat each question as a JSON object with the following structure:\n{\n  "question": "Question text",\n  "options": ["Option A", "Option B", "Option C", "Option D"],\n  "correctOption": 0 // Index of the correct option (0-3)\n}\n\nProvide the questions as a JSON array without any markdown formatting or code blocks.`
      );
  
      console.log('Received response from Gemini API');
      const rawResponse = result.response.text();
      console.log('Raw response:', rawResponse);
  
      // Remove any potential backticks or "json" tag
      const cleanedResponse = rawResponse.replace(/```json\n?|\n?```/g, '').trim();
      
      const generatedQuestions = JSON.parse(cleanedResponse);
  
      console.log('Parsed questions:', generatedQuestions);
  
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

      const pdfContent = fs.readFileSync(req.file.path, { encoding: 'base64' });

      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

      const result = await model.generateContent([
        "Generate 15 multiple-choice questions based on the content of this PDF. Format each question as a JSON object with the following structure: { 'question': 'Question text', 'options': ['Option A', 'Option B', 'Option C', 'Option D'], 'correctOption': 0 } Provide the questions as a JSON array without any markdown formatting or code blocks.",
        {
          inlineData: {
            mimeType: "application/pdf",
            data: pdfContent
          }
        }
      ]);

      const rawResponse = result.response.text();
      const cleanedResponse = rawResponse.replace(/```json\n?|\n?```/g, '').trim();
      const generatedQuestions = JSON.parse(cleanedResponse);

      // Clean up the uploaded file
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
      class: parseInt(quizClass), // Ensure class is saved as a number
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


// ... rest of the file ...

exports.getStudentQuizzes = async (req, res) => {
  try {
    const student = await User.findById(req.user._id);
    if (!student) {
      return res.status(404).json({
        status: 'fail',
        message: 'Student not found'
      });
    }

    const quizzes = await Quiz.find({
      class: student.class,
      section: student.section
    })
    .select('quizCode subject testDate testTime testDuration')
    .sort({ testDate: 1, testTime: 1 });

    res.status(200).json({
      status: 'success',
      quizzes
    });
  } catch (error) {
    console.error('Error in getStudentQuizzes:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};
// ... (previous code)

exports.verifyQuizCode = async (req, res) => {
  try {
    const { quizId, quizCode } = req.body;
    console.log('Verifying quiz code:', quizId, quizCode); // Add this line for debugging

    const student = await User.findById(req.user._id);
    const quiz = await Quiz.findOne({ _id: quizId, quizCode });

    if (!quiz) {
      return res.status(400).json({ status: 'fail', message: 'Invalid quiz code' });
    }

    if (quiz.class !== student.class || quiz.section !== student.section) {
      return res.status(400).json({ status: 'fail', message: 'This quiz is not for your class/section' });
    }

    const currentTime = new Date();
    const quizStartTime = new Date(quiz.testDate + 'T' + quiz.testTime);
    const quizEndTime = new Date(quizStartTime.getTime() + quiz.testDuration * 60000);

    if (currentTime < quizStartTime) {
      return res.status(400).json({ status: 'fail', message: 'The quiz has not started yet' });
    }

    if (currentTime > quizEndTime) {
      return res.status(400).json({ status: 'fail', message: 'The quiz has ended' });
    }

    res.status(200).json({
      status: 'success',
      questions: quiz.questions,
      duration: quiz.testDuration
    });
  } catch (error) {
    console.error('Error in verifyQuizCode:', error); // Add this line for debugging
    res.status(400).json({ status: 'fail', message: error.message });
  }
};
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;
    console.log('Received quiz submission:', { quizId, answers });

    if (!quizId || !answers) {
      return res.status(400).json({ status: 'fail', message: 'Missing quizId or answers' });
    }

    const student = await User.findById(req.user._id);
    if (!student) {
      return res.status(400).json({ status: 'fail', message: 'Student not found' });
    }

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(400).json({ status: 'fail', message: 'Quiz not found' });
    }

    // Calculate score
    let score = 0;
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        score++;
      }
    });

    // Save the result
    const result = await Result.create({
      student: student._id,
      quiz: quizId,
      score,
      answers
    });

    console.log('Quiz result saved:', result);

    res.status(200).json({ status: 'success', message: 'Quiz submitted successfully', score });
  } catch (error) {
    console.error('Error in submitQuiz:', error);
    res.status(400).json({ status: 'fail', message: error.message });
  }
};
exports.getQuizResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user._id })
      .populate('quiz', 'subject testDate')
      .sort('-submittedAt');

    res.status(200).json({
      status: 'success',
      results: results.map(result => ({
        subject: result.quiz.subject,
        testDate: result.quiz.testDate,
        score: result.score,
        submittedAt: result.submittedAt
      }))
    });
  } catch (error) {
    console.error('Error in getQuizResults:', error);
    res.status(400).json({ status: 'fail', message: error.message });
  }
};