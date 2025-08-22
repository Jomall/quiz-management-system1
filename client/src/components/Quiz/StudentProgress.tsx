import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { quizAPI } from '../../services/api';

interface QuizProgress {
  quizId: string;
  title: string;
  description: string;
  totalQuestions: number;
  completedQuestions: number;
  score: number | null;
  maxScore: number;
  status: 'not-started' | 'in-progress' | 'completed';
  startedAt: string | null;
  completedAt: string | null;
  dueDate: string | null;
  timeSpent: number;
  attempts: number;
  maxAttempts: number;
}

interface StudentStats {
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
  totalTimeSpent: number;
  upcomingQuizzes: number;
  overdueQuizzes: number;
}

const StudentProgress: React.FC = () => {
  const { user } = useAuth();
  const [quizProgress, setQuizProgress] = useState<QuizProgress[]>([]);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed' | 'upcoming'>('all');

  useEffect(() => {
    if (user) {
      fetchStudentProgress();
    }
  }, [user]);

  const fetchStudentProgress = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await quizAPI.getStudentProgress(user._id);
      setQuizProgress(response.data.quizProgress);
      setStudentStats(response.data.stats);
    } catch (err) {
      setError('Failed to fetch student progress');
      console.error('Error fetching student progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      case 'not-started': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'in-progress': return 'In Progress';
      case 'not-started': return 'Not Started';
      default: return 'Unknown';
    }
  };

  const filteredQuizzes = quizProgress.filter(quiz => {
    switch (filter) {
      case 'in-progress':
        return quiz.status === 'in-progress';
      case 'completed':
        return quiz.status === 'completed';
      case 'upcoming':
        return quiz.status === 'not-started' && quiz.dueDate && new Date(quiz.dueDate) > new Date();
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Progress</h1>
        <p className="text-gray-600">Track your quiz performance and progress</p>
      </div>

      {/* Stats Overview */}
      {studentStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{studentStats.totalQuizzes}</div>
            <div className="text-sm text-gray-600">Total Quizzes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{studentStats.completedQuizzes}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{studentStats.averageScore.toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Average Score</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">{formatTime(studentStats.totalTimeSpent)}</div>
            <div className="text-sm text-gray-600">Total Time</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-orange-600">{studentStats.upcomingQuizzes}</div>
            <div className="text-sm text-gray-600">Upcoming</div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All Quizzes' },
              { key: 'in-progress', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
              { key: 'upcoming', label: 'Upcoming' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Quiz List */}
      <div className="space-y-4">
        {filteredQuizzes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No quizzes found</p>
          </div>
        ) : (
          filteredQuizzes.map((quiz) => (
            <div key={quiz.quizId} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{quiz.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{quiz.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{quiz.totalQuestions} questions</span>
                      <span>•</span>
                      <span>Max attempts: {quiz.maxAttempts}</span>
                      {quiz.dueDate && (
                        <>
                          <span>•</span>
                          <span>Due: {formatDate(quiz.dueDate)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quiz.status)}`}>
                      {getStatusText(quiz.status)}
                    </span>
                  </div>
                </div>

                {quiz.status !== 'not-started' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Progress</div>
                        <div className="mt-1">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${quiz.status === 'completed' ? 100 : (quiz.completedQuestions / quiz.totalQuestions) * 100}%`
                                }}
                              ></div>
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                              {quiz.completedQuestions}/{quiz.totalQuestions}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {quiz.score !== null && (
                        <div>
                          <div className="text-sm text-gray-600">Score</div>
                          <div className="mt-1 text-lg font-semibold text-gray-900">
                            {quiz.score}/{quiz.maxScore}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <div className="text-sm text-gray-600">Time Spent</div>
                        <div className="mt-1 text-lg font-semibold text-gray-900">
                          {formatTime(quiz.timeSpent)}
                        </div>
                      </div>
                    </div>
                    
                    {quiz.completedAt && (
                      <div className="mt-2 text-sm text-gray-600">
                        Completed on: {formatDate(quiz.completedAt)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentProgress;
