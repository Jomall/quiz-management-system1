import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import InstructorDashboard from './components/Dashboard/InstructorDashboard';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import QuizList from './components/Quiz/QuizList';
import QuizForm from './components/Quiz/QuizForm';
import QuizTaker from './components/Quiz/QuizTaker';
import QuizResults from './components/Quiz/QuizResults';
import ContentList from './components/Content/ContentList';
import ContentForm from './components/Content/ContentForm';
import ContentViewer from './components/Content/ContentViewer';
import UserProfile from './components/User/UserProfile';
import RequestManagement from './components/Requests/RequestManagement';
import InstructorSearch from './components/User/InstructorSearch';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {user && <Navbar />}
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          
          <Route path="/dashboard" element={
            user ? (
              user.role === 'instructor' ? <InstructorDashboard /> : <StudentDashboard />
            ) : (
              <Navigate to="/login" />
            )
          } />
          
          <Route path="/quizzes" element={
            user ? <QuizList /> : <Navigate to="/login" />
          } />
          
          <Route path="/quizzes/create" element={
            user?.role === 'instructor' ? <QuizForm /> : <Navigate to="/dashboard" />
          } />
          
          <Route path="/quizzes/:id/edit" element={
            user?.role === 'instructor' ? <QuizForm /> : <Navigate to="/dashboard" />
          } />
          
          <Route path="/quizzes/:id/take" element={
            user?.role === 'student' ? <QuizTaker /> : <Navigate to="/dashboard" />
          } />
          
          <Route path="/quizzes/:id/results" element={
            user ? <QuizResults /> : <Navigate to="/login" />
          } />
          
          <Route path="/content" element={
            user ? <ContentList /> : <Navigate to="/login" />
          } />
          
          <Route path="/content/create" element={
            user?.role === 'instructor' ? <ContentForm /> : <Navigate to="/dashboard" />
          } />
          
          <Route path="/content/:id" element={
            user ? <ContentViewer /> : <Navigate to="/login" />
          } />
          
          <Route path="/profile" element={
            user ? <UserProfile /> : <Navigate to="/login" />
          } />
          
          <Route path="/requests" element={
            user ? <RequestManagement /> : <Navigate to="/login" />
          } />
          
          <Route path="/instructors" element={
            user?.role === 'student' ? <InstructorSearch /> : <Navigate to="/dashboard" />
          } />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
