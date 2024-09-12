import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AIQuizGenerator from './AIQuizGenerator';

const CreateQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizCode, subject, testDate, testTime } = location.state || {};
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctOption: '',
    isAIGenerated: false
  });

  const handleQuestionChange = (e) => {
    setCurrentQuestion({ ...currentQuestion, question: e.target.value });
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
      setQuestions([...questions, { ...currentQuestion, isAIGenerated: false }]);
      setCurrentQuestion({
        question: '',
        options: ['', '', '', ''],
        correctOption: '',
        isAIGenerated: false
      });
    } else {
      alert('Please fill in the question and select a correct option.');
    }
  };

  const handleAIGeneratedQuestions = (aiQuestions) => {
    const formattedAIQuestions = aiQuestions.map(q => ({
      ...q,
      isAIGenerated: true
    }));
    setQuestions([...questions, ...formattedAIQuestions]);
  };

  const handleSubmit = () => {
    if (questions.length === 0) {
      alert('Please add at least one question before submitting the quiz.');
      return;
    }
    console.log('Quiz submitted:', { quizCode, subject, testDate, testTime, questions });
    navigate('/educator-dashboard');
  };

  const removeQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Create Quiz</h1>
      <div className="flex flex-col md:flex-row">
        {/* Left side - AI Quiz Generator */}
        <div className="w-full md:w-1/2 pr-0 md:pr-4 mb-8 md:mb-0">
          <AIQuizGenerator onQuestionsGenerated={handleAIGeneratedQuestions} />
          
          {/* Display AI generated questions */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">AI Generated Questions</h2>
            {questions.filter(q => q.isAIGenerated).map((q, index) => (
              <div key={index} className="mb-4 p-4 bg-gray-100 rounded">
                <h3 className="font-bold mb-2">Question {index + 1}</h3>
                <p className="mb-2">{q.question}</p>
                <ol className="list-decimal list-inside">
                  {q.options.map((option, optIndex) => (
                    <li key={optIndex} className={optIndex === parseInt(q.correctOption) ? 'font-bold' : ''}>
                      {option}
                    </li>
                  ))}
                </ol>
                <button
                  onClick={() => removeQuestion(questions.indexOf(q))}
                  className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Manual Question creation form */}
        <div className="w-full md:w-1/2 pl-0 md:pl-4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Quiz Details</h2>
            <p>Quiz Code: {quizCode}</p>
            <p>Subject: {subject}</p>
            <p>Test Date: {testDate}</p>
            <p>Test Time: {testTime}</p>
          </div>

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

          {/* Display manually added questions */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Manually Added Questions</h2>
            {questions.filter(q => !q.isAIGenerated).map((q, index) => (
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
                  onClick={() => removeQuestion(questions.indexOf(q))}
                  className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Submit Quiz button */}
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