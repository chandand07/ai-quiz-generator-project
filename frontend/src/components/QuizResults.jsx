import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const QuizResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { quizId } = useParams();

  useEffect(() => {
    const fetchResults = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/quiz/${quizId}/results`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (!response.ok) {
            throw new Error('Failed to fetch results');
          }
          const data = await response.json();
          setResults(data.results);
        } catch (error) {
          console.error('Error fetching results:', error);
          setError('Failed to load results. Please try again.');
        } finally {
          setLoading(false);
        }
      };
  
      fetchResults();
    }, [quizId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Quiz Results</h1>
      <table className="min-w-full bg-white shadow-md rounded-lg">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border">S.No</th>
            <th className="py-2 px-4 border">Student Name</th>
            <th className="py-2 px-4 border">Subject</th>
            <th className="py-2 px-4 border">Score</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={result._id}>
              <td className="py-2 px-4 border">{index + 1}</td>
              <td className="py-2 px-4 border">{result.studentName}</td>
              <td className="py-2 px-4 border">{result.subject}</td>
              <td className="py-2 px-4 border">{result.score}/{result.totalQuestions}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuizResults;