import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AIQuizGenerator from './AIQuizGenerator';

const CreateQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId, quizCode, subject, testDate, testTime, testDuration } = location.state || {};
  const [aiQuestions, setAiQuestions] = useState([]);
  const [manualQuestions, setManualQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    question: '',
    options: ['', '', '', ''],
    correctOption: '',
  });

  useEffect(() => {
    if (!quizId) {
      navigate('/quiz-details');
    }
  }, [quizId, navigate]);

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
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 pr-0 md:pr-4 mb-8 md:mb-0">
          <AIQuizGenerator onQuestionsGenerated={(generatedQuestions) => setAiQuestions(generatedQuestions)} />
          
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
                <button
                  onClick={() => removeAIQuestion(index)}
                  className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full md:w-1/2 pl-0 md:pl-4">
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Quiz Details</h2>
            <p>Quiz Code: {quizCode}</p>
            <p>Subject: {subject}</p>
            <p>Test Date: {testDate}</p>
            <p>Test Time: {testTime}</p>
            <p>Test Duration: {testDuration} minutes</p>
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