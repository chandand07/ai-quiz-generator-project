import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const StudentQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId, quizCode, subject, testDate, testTime, questions, duration } = location.state || {};
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration * 60); 
  const [selectedAnswers, setSelectedAnswers] = useState({});

  

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleOptionSelect = (optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: optionIndex
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  

  const handleSubmit = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ quizId, answers: selectedAnswers })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'success') {
        alert(`Quiz submitted successfully. Your score: ${data.score}/${data.totalQuestions}`);
        navigate('/dashboard', { state: { quizSubmitted: true } });
      } else {
        alert(data.message || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('An error occurred. Please try again.');
    }
  };


  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-start mb-8">
        <div className="text-2xl font-bold">
          Time Left: {formatTime(timeLeft)}
        </div>
        <div className="text-right">
          <p>Subject: {subject}</p>
          <p>Test Date: {testDate}</p>
          <p>Quiz Code: {quizCode}</p>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
          {questions.map((q, index) => (
            <button
              key={q.id}
              className={`w-10 h-10 rounded-full ${currentQuestion === index ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              onClick={() => setCurrentQuestion(index)}
            >
              {q.id}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Question {questions[currentQuestion].id}</h2>
        <p className="mb-4">{questions[currentQuestion].question}</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              className={`bg-white border border-gray-300 rounded p-4 text-left hover:bg-gray-100 ${selectedAnswers[currentQuestion] === index ? 'bg-blue-500 text-black' : ''}`}
              onClick={() => handleOptionSelect(index)}
            >
              {option}
            </button>
          ))}
        </div>
        <p className="mb-4">Selected option: {selectedAnswers[currentQuestion] !== undefined ? questions[currentQuestion].options[selectedAnswers[currentQuestion]] : 'None'}</p>
        {currentQuestion < questions.length - 1 ? (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleNextQuestion}
          >
            Next Question
          </button>
        ) : (
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleSubmit}
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentQuiz;