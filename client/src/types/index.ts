export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor';
  createdAt: string;
}

export interface Question {
  _id?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
}

export interface Quiz {
  _id: string;
  title: string;
  description: string;
  questions: Question[];
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Content {
  _id: string;
  title: string;
  description: string;
  type: 'video' | 'document' | 'interactive';
  url: string;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface QuizSubmission {
  _id: string;
  quiz: Quiz;
  student: User;
  answers: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
    points: number;
  }[];
  score: number;
  totalPoints: number;
  submittedAt: string;
}

export interface Request {
  _id: string;
  student: User;
  instructor: User;
  type: 'quiz' | 'content';
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'instructor';
}
