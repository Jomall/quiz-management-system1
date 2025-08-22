import React, { useState, useEffect } from 'react';
import { quizAPI } from '../../services/api';
import { Quiz } from '../../types';

interface QuizListProps {
  userRole: 'student' | 'instructor';
}

const QuizList: React.FC<QuizListProps> = ({ userRole }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await quizAPI.getAll();
      setQuizzes(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch quizzes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId: string) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await quizAPI.delete(quizId);
        fetchQuizzes();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to delete quiz');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {quizzes.map((quiz) => (
          <li key={quiz._id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-600 truncate">
                    {quiz.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {quiz.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {quiz.questions.length} questions • Created by {quiz.createdBy.name}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex space-x-2">
                  {userRole === 'student' && (
                    <button
                      onClick={() => window.location.href = `/quizzes/${quiz._id}/take`}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Take Quiz
                    </button>
                  )}
                  {userRole === 'instructor' && (
                    <>
                      <button
                        onClick={() => window.location.href = `/quizzes/${quiz._id}/edit`}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(quiz._id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuizList;
