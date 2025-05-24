// src/components/CreateQuiz.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import AIQuizGenerator from './AIQuizGenerator'; // For prompt/PDF

const BACKEND_URL = 'http://localhost:5000';

const CreateQuiz = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { quizId: initialQuizId, quizDetails: initialQuizDetails } = location.state || {};

  const [quizId, setQuizId] = useState(initialQuizId);
  const [quizDetails, setQuizDetails] = useState(initialQuizDetails);

  const [manualQuestions, setManualQuestions] = useState([]);
  const [currentManualQuestion, setCurrentManualQuestion] = useState({
    question: '', options: ['', '', '', ''], correctOption: '',
  });

  const [aiPromptQuestions, setAiPromptQuestions] = useState([]);
  const [aiGeneratorParams, setAiGeneratorParams] = useState({
    numberOfQuestions: '', difficultyLevel: '', testDuration: '', prompt: '',
  });

  const [videoFile, setVideoFile] = useState(null);
  const [isVideoProcessing, setIsVideoProcessing] = useState(false);
  const [videoProcessingStatus, setVideoProcessingStatus] = useState('');
  const [processedVideoId, setProcessedVideoId] = useState(null);
  const [videoGeneratedQuestions, setVideoGeneratedQuestions] = useState([]);

  const [displaySource, setDisplaySource] = useState('prompt');

  useEffect(() => {
    if (initialQuizId && initialQuizId !== quizId) setQuizId(initialQuizId);
    if (initialQuizDetails && initialQuizDetails !== quizDetails) setQuizDetails(initialQuizDetails);
    if (!initialQuizId && !quizId) {
        // console.warn('Quiz ID missing, consider redirecting or showing an error.');
        // navigate('/quiz-details'); // Example redirect
    }
  }, [initialQuizId, initialQuizDetails, quizId, navigate]);

  const handleManualQuestionChange = (e) => setCurrentManualQuestion({ ...currentManualQuestion, question: e.target.value });
  const handleManualOptionChange = (index, value) => {
    const newOptions = [...currentManualQuestion.options];
    newOptions[index] = value;
    setCurrentManualQuestion({ ...currentManualQuestion, options: newOptions });
  };
  const handleManualCorrectOptionChange = (e) => setCurrentManualQuestion({ ...currentManualQuestion, correctOption: e.target.value });

  const addManualQuestion = () => {
    if (currentManualQuestion.question && currentManualQuestion.options.every(opt => opt.trim() !== '') && currentManualQuestion.correctOption) {
      setManualQuestions([...manualQuestions, { ...currentManualQuestion, id: `manual-${Date.now()}` }]);
      setCurrentManualQuestion({ question: '', options: ['', '', '', ''], correctOption: '' });
    } else {
      alert('Please fill in the question, all four options, and select a correct option.');
    }
  };
  const removeManualQuestion = (idToRemove) => setManualQuestions(manualQuestions.filter(q => q.id !== idToRemove));

  const handleAIParamChange = (e) => setAiGeneratorParams(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handlePromptQuestionsGenerated = (generatedQuestions) => {
    setAiPromptQuestions(generatedQuestions.map((q, idx) => ({ ...q, id: `prompt-${idx}`, correctOptionIndex: q.correctOption })));
    setDisplaySource('prompt');
  };

  const handleVideoFileChange = (e) => setVideoFile(e.target.files[0]);

  const handleGenerateFromVideo = async () => {
    if (!videoFile) return alert('Please select a video file.');
    if (!quizId) return alert('Quiz ID is missing. Please ensure quiz details were saved.');

    setIsVideoProcessing(true);
    setVideoProcessingStatus('Uploading video...');
    setVideoGeneratedQuestions([]);
    const formData = new FormData();
    formData.append('videoFile', videoFile);

    try {
      const response = await fetch(`${BACKEND_URL}/api/video/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || `HTTP error! status: ${response.status}`);
      
      setVideoProcessingStatus('Video uploaded. Processing started...');
      setProcessedVideoId(data.videoId);
      pollVideoStatus(data.videoId);
    } catch (error) {
      console.error('Error uploading video:', error);
      alert(`Error starting video processing: ${error.message}`);
      setIsVideoProcessing(false);
      setVideoProcessingStatus('Upload failed.');
    }
  };

  const fetchVideoResults = useCallback(async (videoId) => {
    setVideoProcessingStatus('Fetching generated MCQs...');
    try {
      const resultsResponse = await fetch(`${BACKEND_URL}/api/video/${videoId}/results`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const resultsData = await resultsResponse.json();
      if (!resultsResponse.ok) throw new Error(resultsData.message || 'Failed to fetch video results.');

      let allMcqs = [];
      if (resultsData.processedSegments) {
        resultsData.processedSegments.forEach(segment => {
          if (segment.mcqs && segment.mcqs.length > 0) {
            segment.mcqs.forEach((mcq, idx) => {
              allMcqs.push({
                id: `video-${segment.segmentIndex}-${idx}`,
                question: mcq.question,
                options: mcq.options,
                correctOptionIndex: mcq.correctOptionIndex
              });
            });
          }
        });
      }
      setVideoGeneratedQuestions(allMcqs);
      setDisplaySource('video');
      setVideoProcessingStatus(allMcqs.length > 0 ? `${allMcqs.length} MCQs loaded from video!` : 'No MCQs generated from video content.');
    } catch (error) {
      console.error('Error fetching video results:', error);
      alert(`Error fetching MCQs from video: ${error.message}`);
      setVideoProcessingStatus('Failed to load MCQs from video.');
    } finally {
        setIsVideoProcessing(false); // Ensure this is set false after fetching or error
    }
  }, []);

  const pollVideoStatus = useCallback((videoId) => {
    const intervalId = setInterval(async () => {
      try {
        const statusResponse = await fetch(`${BACKEND_URL}/api/video/${videoId}/status`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!statusResponse.ok) {
            const errorText = await statusResponse.text();
            throw new Error(errorText || `Failed to fetch status: ${statusResponse.status}`);
        }
        const statusData = await statusResponse.json();
        setVideoProcessingStatus(`Status: ${statusData.status || 'Unknown'} ${statusData.errorMessage ? `(${statusData.errorMessage})` : ''}`);

        if (statusData.status === 'completed') {
          clearInterval(intervalId);
          //setIsVideoProcessing(false); // This will be handled by fetchVideoResults
          fetchVideoResults(videoId);
        } else if (statusData.status === 'failed') {
          clearInterval(intervalId);
          setIsVideoProcessing(false);
          setVideoProcessingStatus(`Processing failed: ${statusData.errorMessage || 'Unknown error'}`);
        }
      } catch (err) {
        console.error('Polling error:', err);
        setVideoProcessingStatus(`Error polling status: ${err.message}`);
        clearInterval(intervalId);
        setIsVideoProcessing(false);
      }
    }, 7000);
    // Store intervalId to clear it if component unmounts or videoId changes
    // This is a simplified cleanup; for robust cleanup, use a ref for intervalId.
    return () => clearInterval(intervalId);
  }, [fetchVideoResults]);


  const displayedAIQuestions = displaySource === 'video' ? videoGeneratedQuestions : aiPromptQuestions;

  const addAiQuestionToManualList = (aiQuestion) => {
    const correctIdx = aiQuestion.correctOptionIndex !== undefined ? aiQuestion.correctOptionIndex : aiQuestion.correctOption;
    if (typeof correctIdx !== 'number' || correctIdx < 0 || correctIdx > 3) {
        alert(`Error: AI Question "${aiQuestion.question}" has an invalid correct option index.`);
        return;
    }
    const manualFormattedQuestion = {
      id: `manual-${aiQuestion.id}-${Date.now()}`,
      question: aiQuestion.question,
      options: [...aiQuestion.options],
      correctOption: (correctIdx + 1).toString(),
    };
    setManualQuestions(prev => [...prev, manualFormattedQuestion]);

    if (displaySource === 'video') {
      setVideoGeneratedQuestions(prev => prev.filter(q => q.id !== aiQuestion.id));
    } else {
      setAiPromptQuestions(prev => prev.filter(q => q.id !== aiQuestion.id));
    }
  };

  const removeDisplayedAIQuestion = (idToRemove) => {
    if (displaySource === 'video') {
      setVideoGeneratedQuestions(prev => prev.filter(q => q.id !== idToRemove));
    } else {
      setAiPromptQuestions(prev => prev.filter(q => q.id !== idToRemove));
    }
  };

  const handleSubmitFinalQuiz = async () => {
    if (manualQuestions.length === 0) return alert('Please add at least one question.');
    if (!quizId) return alert('Quiz ID is missing.');

    try {
      const questionsForBackend = manualQuestions.map(q => {
        const correctOptIndex = parseInt(q.correctOption, 10) - 1;
        if (isNaN(correctOptIndex) || correctOptIndex < 0 || correctOptIndex >= q.options.length) {
          throw new Error(`Invalid correct option for question: "${q.question}".`);
        }
        return {
          question: q.question, options: q.options, correctAnswer: q.options[correctOptIndex],
        };
      });

      const response = await fetch(`${BACKEND_URL}/api/quiz/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ quizId, questions: questionsForBackend }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create quiz');
      alert('Quiz created successfully!');
      navigate('/educator-dashboard');
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert(`Error: ${error.message}`);
    }
  };

  // Basic Tailwind classes for styling
  const inputBaseClass = "mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-none";
  const buttonBaseClass = "px-4 py-2 rounded-md font-semibold text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
  const primaryButtonClass = `${buttonBaseClass} text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:opacity-50`;
  const secondaryButtonClass = `${buttonBaseClass} text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500`;
  const dangerButtonSmClass = `${buttonBaseClass} text-white bg-red-500 hover:bg-red-600 focus:ring-red-500 text-xs px-2 py-1`;
  const successButtonSmClass = `${buttonBaseClass} text-white bg-green-500 hover:bg-green-600 focus:ring-green-500 text-xs px-2 py-1`;
  const purpleButtonClass = `${buttonBaseClass} text-white bg-purple-600 hover:bg-purple-700 focus:ring-purple-500 disabled:opacity-50`;


  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Create Quiz Questions</h1>
      
      {quizDetails && (
        <div className="bg-slate-100 rounded-lg shadow p-4 mb-8">
          <h2 className="text-xl font-semibold mb-3 text-slate-700">Quiz Details Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600">
            <p><strong>Code:</strong> {quizDetails.quizCode}</p>
            <p><strong>Subject:</strong> {quizDetails.subject}</p>
            <p><strong>Date:</strong> {new Date(quizDetails.testDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {quizDetails.testTime}</p>
            <p><strong>Duration:</strong> {quizDetails.testDuration} mins</p>
            <p><strong>Class:</strong> {quizDetails.class}</p>
            <p><strong>Section:</strong> {quizDetails.section}</p>
          </div>
        </div>
      )}
      {!quizId && <p className="text-red-600 bg-red-100 p-3 rounded-md mb-4">Warning: Quiz ID is not set. Please ensure you have saved quiz details before proceeding.</p>}
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/2 flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-700">Generate from Prompt / PDF</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Number of Questions</label>
                <input type="number" name="numberOfQuestions" className={inputBaseClass} value={aiGeneratorParams.numberOfQuestions} onChange={handleAIParamChange}/>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Difficulty Level</label>
                <select name="difficultyLevel" className={inputBaseClass} value={aiGeneratorParams.difficultyLevel} onChange={handleAIParamChange}>
                  <option value="">Select Difficulty</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Test Duration (minutes, for Prompt context)</label>
                <input type="number" name="testDuration" className={inputBaseClass} value={aiGeneratorParams.testDuration} onChange={handleAIParamChange} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Prompt</label>
                <textarea name="prompt" className={`${inputBaseClass} min-h-[60px]`} rows="3" value={aiGeneratorParams.prompt} onChange={handleAIParamChange}></textarea>
              </div>
            </div>
            <AIQuizGenerator onQuestionsGenerated={handlePromptQuestionsGenerated} params={aiGeneratorParams} />
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-700">Generate Quiz from Video Lecture</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Upload Video File (MP4, MOV, etc.)</label>
              <input type="file" accept="video/*" onChange={handleVideoFileChange} className={`${inputBaseClass} file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`} disabled={isVideoProcessing}/>
            </div>
            <button onClick={handleGenerateFromVideo} className={`${purpleButtonClass} w-full`} disabled={!videoFile || isVideoProcessing || !quizId}>
              {isVideoProcessing ? 'Processing Video...' : 'Generate from Video'}
            </button>
            {videoProcessingStatus && <p className={`mt-3 text-sm ${isVideoProcessing ? 'text-blue-600 animate-pulse' : 'text-slate-600'}`}>{videoProcessingStatus}</p>}
          </div>
          
          {(aiPromptQuestions.length > 0 || videoGeneratedQuestions.length > 0) && (
            <div className="bg-white rounded-lg shadow-xl p-6">
                 <div className="flex justify-between items-center mb-4">
                     <h2 className="text-xl font-bold text-slate-700">AI Generated Questions</h2>
                     <div>
                         {videoGeneratedQuestions.length > 0 && <button onClick={() => setDisplaySource('video')} className={`mr-2 p-1 px-3 text-xs rounded-full ${displaySource === 'video' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'}`}>Video ({videoGeneratedQuestions.length})</button>}
                         {aiPromptQuestions.length > 0 && <button onClick={() => setDisplaySource('prompt')} className={`p-1 px-3 text-xs rounded-full ${displaySource === 'prompt' ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'}`}>Prompt/PDF ({aiPromptQuestions.length})</button>}
                     </div>
                 </div>

              {displayedAIQuestions.length === 0 && <p className="text-slate-500">No AI questions to display for the selected source.</p>}
              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                {displayedAIQuestions.map((q) => (
                  <div key={q.id} className="p-3 bg-slate-50 rounded-md border border-slate-200">
                    <p className="mb-1 font-medium text-slate-800 text-sm">{q.question}</p>
                    <ol className="list-decimal list-inside text-xs text-slate-600 space-y-0.5 pl-4">
                      {q.options.map((option, optIndex) => (
                        <li key={optIndex} className={optIndex === q.correctOptionIndex ? 'font-semibold text-green-700' : ''}>
                          {option}
                        </li>
                      ))}
                    </ol>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => removeDisplayedAIQuestion(q.id)} className={dangerButtonSmClass}>Remove</button>
                      <button onClick={() => addAiQuestionToManualList(q)} className={successButtonSmClass}>Add to Quiz</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:w-1/2 flex flex-col gap-6">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-700">Add New Question Manually</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Question</label>
                <input type="text" className={inputBaseClass} value={currentManualQuestion.question} onChange={handleManualQuestionChange} />
              </div>
              {currentManualQuestion.options.map((option, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Option {index + 1}</label>
                  <input type="text" className={inputBaseClass} value={option} onChange={(e) => handleManualOptionChange(index, e.target.value)} />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Correct Option (Enter number 1-4)</label>
                <input type="number" min="1" max="4" className={inputBaseClass} value={currentManualQuestion.correctOption} onChange={handleManualCorrectOptionChange} />
              </div>
            </div>
            <button onClick={addManualQuestion} className={`${secondaryButtonClass} w-full mt-4`}>Add Manual Question</button>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-slate-700">Current Quiz Questions ({manualQuestions.length})</h2>
            {manualQuestions.length === 0 && <p className="text-slate-500">No questions added yet.</p>}
             <div className="max-h-[500px] overflow-y-auto space-y-3 pr-2">
                {manualQuestions.map((q) => (
                  <div key={q.id} className="p-3 bg-slate-50 rounded-md border border-slate-200">
                    <p className="mb-1 font-medium text-slate-800 text-sm">{q.question}</p>
                    <ol className="list-decimal list-inside text-xs text-slate-600 space-y-0.5 pl-4">
                      {q.options.map((option, optIndex) => (
                        <li key={optIndex} className={optIndex + 1 === parseInt(q.correctOption) ? 'font-semibold text-green-700' : ''}>
                          {option}
                        </li>
                      ))}
                    </ol>
                    <button onClick={() => removeManualQuestion(q.id)} className={`${dangerButtonSmClass} mt-2`}>Remove from Quiz</button>
                  </div>
                ))}
            </div>
             <button onClick={handleSubmitFinalQuiz} className={`${primaryButtonClass} w-full mt-6`} disabled={manualQuestions.length === 0 || !quizId}>
                Submit Final Quiz
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateQuiz;