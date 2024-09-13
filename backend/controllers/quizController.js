const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require('node-fetch');
const multer = require('multer');
const fs = require('fs');

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
const Quiz = require('../models/Quiz');

exports.createQuizDetails = async (req, res) => {
  try {
    console.log('Received quiz details:', req.body);
    const { quizCode, subject, testDate, testTime, testDuration } = req.body;
    const quiz = await Quiz.create({
      quizCode,
      subject,
      testDate,
      testTime,
      testDuration: parseInt(testDuration),
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
      .select('quizCode subject testDate testTime testDuration')
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