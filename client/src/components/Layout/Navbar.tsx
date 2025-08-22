import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-blue-600">QuizKnow</h1>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
              {user && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Dashboard
                  </Link>
                  {user.role === 'instructor' && (
                    <>
                      <Link
                        to="/quizzes/create"
                        className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Create Quiz
                      </Link>
                      <Link
                        to="/content/create"
                        className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Create Content
                      </Link>
                    </>
                  )}
                  {user.role === 'student' && (
                    <>
                      <Link
                        to="/quizzes"
                        className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Take Quiz
                      </Link>
                      <Link
                        to="/content"
                        className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Study Content
                      </Link>
                      <Link
                        to="/requests"
                        className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        My Requests
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Welcome, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm text-gray-700 hover:text-blue-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
