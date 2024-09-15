import React, { useState } from 'react';

const AIQuizGenerator = ({ onQuestionsGenerated, params }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePromptSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('Sending AI generator params:', params);
      const response = await fetch('http://localhost:5000/api/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(params),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || 'Unknown error';
        } catch {
          errorMessage = responseText;
        }
        throw new Error(`Failed to generate quiz: ${response.status} ${response.statusText}. ${errorMessage}`);
      }

      const data = JSON.parse(responseText);
      console.log('Generated questions:', data.questions);
      onQuestionsGenerated(data.questions);
    } catch (error) {
      console.error('Full error:', error);
      alert(`Failed to generate quiz. Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a file first.');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    Object.keys(params).forEach(key => {
      formData.append(key, params[key]);
    });

    try {
      const response = await fetch('http://localhost:5000/api/generate-quiz-from-pdf', {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorData.message || 'Unknown error';
        } catch {
          errorMessage = responseText;
        }
        throw new Error(`Failed to generate quiz from PDF: ${response.status} ${response.statusText}. ${errorMessage}`);
      }

      const data = JSON.parse(responseText);
      console.log('Generated questions from PDF:', data.questions);
      onQuestionsGenerated(data.questions);
    } catch (error) {
      console.error('Full error:', error);
      alert(`Failed to generate quiz from PDF. Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">AI Quiz Generator</h2>
      <form onSubmit={handlePromptSubmit}>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
          disabled={isLoading || !params.prompt}
        >
          {isLoading ? 'Generating...' : 'Generate Quiz from Prompt'}
        </button>
      </form>
      <form onSubmit={handleFileUpload} className="mt-4">
        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="mb-2"
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={isLoading || !file}
        >
          {isLoading ? 'Generating...' : 'Generate Quiz from PDF'}
        </button>
      </form>
    </div>
  );
};

export default AIQuizGenerator;