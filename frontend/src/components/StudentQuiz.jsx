import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const StudentQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId, quizCode, subject, testDate, questions, duration } = location.state || {};
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [warningCount, setWarningCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const MAX_WARNINGS = 3;

  // Handle quiz submission
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
      
      const data = await response.json();
      alert(data.status === 'success' 
        ? `Quiz submitted! Score: ${data.score}/${data.totalQuestions}`
        : 'Failed to submit quiz');
      navigate('/dashboard');
    } catch (error) {
      alert('Error submitting quiz. Try again.');
    }
  };

  // Enter fullscreen
  const enterFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) element.requestFullscreen();
    else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
  };

  useEffect(() => {
    if (!location.state) {
      navigate('/dashboard');
      return;
    }

    // Check fullscreen status
    const checkFullscreen = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement));
    };

    // Handle tab switching
    const handleVisibilityChange = () => {
      if (document.hidden) {
        const newCount = warningCount + 1;
        if (newCount >= MAX_WARNINGS) {
          alert("Maximum warnings reached. Submitting quiz.");
          handleSubmit();
          return;
        }
        alert(`Warning ${newCount}/${MAX_WARNINGS}: No tab switching allowed!`);
        setWarningCount(newCount);
      }
    };

    // Timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Block keyboard shortcuts
    const blockShortcuts = (e) => {
      if ((e.ctrlKey && ['c', 'v'].includes(e.key)) || e.key === 'PrintScreen') {
        e.preventDefault();
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', checkFullscreen);
    document.addEventListener('webkitfullscreenchange', checkFullscreen);
    document.addEventListener('keydown', blockShortcuts);
    document.addEventListener('contextmenu', e => e.preventDefault());

    checkFullscreen();

    // Cleanup
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', checkFullscreen);
      document.removeEventListener('webkitfullscreenchange', checkFullscreen);
      document.removeEventListener('keydown', blockShortcuts);
      document.removeEventListener('contextmenu', e => e.preventDefault());
    };
  }, [location.state, navigate, warningCount]);

  if (!questions || !duration) return <div>Loading...</div>;

  // Fullscreen warning
  if (!isFullscreen) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">⚠️ Enter Fullscreen</h2>
          <p className="mb-4">Press F11 to start quiz</p>
          <button onClick={enterFullscreen} className="bg-blue-500 text-white px-6 py-2 rounded">
            Enter Fullscreen
          </button>
        </div>
      </div>
    );
  }

  // Format time display
  const formatTime = time => `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, '0')}`;

  return (
    <div className="container mx-auto p-8">
      {/* Header */}
      <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-4">
        <p>⚠️ Warning: {warningCount}/{MAX_WARNINGS} tab switches</p>
        <p>Time Left: {formatTime(timeLeft)}</p>
        <p>Quiz Code: {quizCode} | Subject: {subject}</p>
      </div>

      {/* Questions */}
      <div className="max-w-2xl mx-auto">
        {/* Question Navigation */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-10 h-10 rounded-full ${
                currentQuestion === index ? 'bg-blue-500 text-white' :
                selectedAnswers[index] !== undefined ? 'bg-green-500 text-white' :
                'bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {/* Current Question */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Question {currentQuestion + 1}</h2>
          <p className="mb-4">{questions[currentQuestion].question}</p>
          
          {/* Options */}
          <div className="grid grid-cols-2 gap-4">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => setSelectedAnswers({...selectedAnswers, [currentQuestion]: index})}
                className={`p-4 text-left rounded border ${
                  selectedAnswers[currentQuestion] === index 
                  ? 'bg-blue-100 border-blue-500' 
                  : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestion(prev => prev - 1)}
            disabled={currentQuestion === 0}
            className={`px-4 py-2 rounded ${
              currentQuestion === 0 ? 'bg-gray-300' : 'bg-blue-500 text-white'
            }`}
          >
            Previous
          </button>

          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentQuiz;