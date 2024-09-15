import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AIQuizGenerator from './AIQuizGenerator';

const CreateQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId, quizDetails } = location.state || {};
  const [aiQuestions, setAiQuestions] = useState([]);
  const [manualQuestions, setManualQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctOption: '',
  });
  const [aiGeneratorParams, setAiGeneratorParams] = useState({
    numberOfQuestions: '',
    difficultyLevel: '',
    testDuration: '',
    prompt: '',
  });

  useEffect(() => {
    if (!quizId) {
      navigate('/quiz-details');
    }
  }, [quizId, navigate]);

  const handleAIParamChange = (e) => {
    const { name, value } = e.target;
    setAiGeneratorParams(prev => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (e) => {
    setCurrentQuestion({ ...currentQuestion, question: e.target.value });
  };
  
  const addAIQuestionToManual = (question) => {
    setManualQuestions([...manualQuestions, question]);
    setAiQuestions(aiQuestions.filter(q => q !== question));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleCorrectOptionChange = (e) => {
    setCurrentQuestion({ ...currentQuestion, correctOption: e.target.value });
  };

  const addQuestion = () => {
    if (currentQuestion.question && currentQuestion.correctOption) {
      setManualQuestions([...manualQuestions, currentQuestion]);
      setCurrentQuestion({
        question: '',
        options: ['', '', '', ''],
        correctOption: '',
      });
    } else {
      alert('Please fill in the question and select a correct option.');
    }
  };

  const removeManualQuestion = (index) => {
    const newQuestions = [...manualQuestions];
    newQuestions.splice(index, 1);
    setManualQuestions(newQuestions);
  };

  const removeAIQuestion = (index) => {
    const newQuestions = [...aiQuestions];
    newQuestions.splice(index, 1);
    setAiQuestions(newQuestions);
  };

  const handleSubmit = async () => {
    if (manualQuestions.length === 0) {
      alert('Please add at least one question before submitting the quiz.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/quiz/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          quizId,
          questions: manualQuestions.map(q => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.options[parseInt(q.correctOption) - 1]
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create quiz');
      }

      alert('Quiz created successfully!');
      navigate('/educator-dashboard');
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert(error.message || 'An error occurred while creating the quiz. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Create Quiz</h1>
      
      {/* Display Quiz Details */}
      {quizDetails && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quiz Details</h2>
          <p>Quiz Code: {quizDetails.quizCode}</p>
          <p>Subject: {quizDetails.subject}</p>
          <p>Test Date: {quizDetails.testDate}</p>
          <p>Test Time: {quizDetails.testTime}</p>
          <p>Test Duration: {quizDetails.testDuration} minutes</p>
          <p>Class: {quizDetails.class}</p>
          <p>Section: {quizDetails.section}</p>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 pr-0 md:pr-4 mb-8 md:mb-0">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">AI Quiz Generator Parameters</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Number of Questions</label>
              <input
                type="number"
                name="numberOfQuestions"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={aiGeneratorParams.numberOfQuestions}
                onChange={handleAIParamChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Difficulty Level</label>
              <select
                name="difficultyLevel"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={aiGeneratorParams.difficultyLevel}
                onChange={handleAIParamChange}
              >
                <option value="">Select Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Test Duration (minutes)</label>
              <input
                type="number"
                name="testDuration"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={aiGeneratorParams.testDuration}
                onChange={handleAIParamChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Prompt</label>
              <textarea
                name="prompt"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={aiGeneratorParams.prompt}
                onChange={handleAIParamChange}
                rows="4"
              ></textarea>
            </div>
          </div>
          
          <AIQuizGenerator 
            onQuestionsGenerated={(generatedQuestions) => setAiQuestions(generatedQuestions)}
            params={aiGeneratorParams}
          />
          
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-xl font-bold mb-4">AI Generated Questions</h2>
            {aiQuestions.map((q, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-100 rounded">
                <h3 className="font-bold mb-2">Question {index + 1}</h3>
                <p className="mb-2">{q.question}</p>
                <ol className="list-decimal list-inside">
                  {q.options.map((option, optIndex) => (
                    <li key={optIndex} className={optIndex === q.correctOption ? 'font-bold' : ''}>
                      {option}
                    </li>
                  ))}
                </ol>
                <div className="mt-2">
                  <button
                    onClick={() => removeAIQuestion(index)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm mr-2"
                  >
                    Remove
                  </button>
                  <button
                    onClick={() => addAIQuestionToManual(q)}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm"
                  >
                    Add Question
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-1/2 pl-0 md:pl-4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Add New Question</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Question</label>
              <input
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={currentQuestion.question}
                onChange={handleQuestionChange}
              />
            </div>
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Option {index + 1}</label>
                <input
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
              </div>
            ))}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Correct Option (1-4)</label>
              <input
                type="number"
                min="1"
                max="4"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={currentQuestion.correctOption}
                onChange={handleCorrectOptionChange}
              />
            </div>
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={addQuestion}
            >
              Add Question
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Manually Added Questions</h2>
            {manualQuestions.map((q, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-100 rounded">
                <h3 className="font-bold mb-2">Question {index + 1}</h3>
                <p className="mb-2">{q.question}</p>
                <ol className="list-decimal list-inside">
                  {q.options.map((option, optIndex) => (
                    <li key={optIndex} className={optIndex + 1 === parseInt(q.correctOption) ? 'font-bold' : ''}>
                      {option}
                    </li>
                  ))}
                </ol>
                <button
                  onClick={() => removeManualQuestion(index)}
                  className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={handleSubmit}
          >
            Submit Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;