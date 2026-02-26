import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/auth/Login';

// Admin
import AdminDashboard from './pages/admin/Dashboard';
import AcademicYears from './pages/admin/AcademicYears';
import Departments from './pages/admin/Departments';
import Majors from './pages/admin/Majors';
import Sections from './pages/admin/Sections';
import Companies from './pages/admin/Companies';
import UsersList from './pages/admin/Users';

// Teacher
import TeacherDashboard from './pages/teacher/Dashboard';
import TeacherStudents from './pages/teacher/Students';
import TeacherStudentDetail from './pages/teacher/StudentDetail';
import Supervisions from './pages/teacher/Supervisions';
import TeacherEvaluations from './pages/teacher/Evaluations';
import TeacherWeeklyReports from './pages/teacher/WeeklyReports';

// Student
import StudentDashboard from './pages/student/Dashboard';
import StudentAttendance from './pages/student/Attendance';
import StudentLeaveRequests from './pages/student/LeaveRequests';
import DailyLogs from './pages/student/DailyLogs';
import StudentWeeklyReports from './pages/student/WeeklyReports';

// Mentor
import MentorDashboard from './pages/mentor/Dashboard';
import MentorLeaveRequests from './pages/mentor/LeaveRequests';
import MentorEvaluations from './pages/mentor/Evaluations';

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={`/${user.role}/dashboard`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: '#1e293b', color: '#fff', fontSize: '14px' } }} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RootRedirect />} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="academic-years" element={<AcademicYears />} />
            <Route path="departments" element={<Departments />} />
            <Route path="majors" element={<Majors />} />
            <Route path="sections" element={<Sections />} />
            <Route path="companies" element={<Companies />} />
            <Route path="users" element={<UsersList />} />
          </Route>

          {/* Teacher */}
          <Route path="/teacher" element={<ProtectedRoute roles={['teacher']}><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="students" element={<TeacherStudents />} />
            <Route path="students/:id" element={<TeacherStudentDetail />} />
            <Route path="supervisions" element={<Supervisions />} />
            <Route path="evaluations" element={<TeacherEvaluations />} />
            <Route path="weekly-reports" element={<TeacherWeeklyReports />} />
          </Route>

          {/* Student */}
          <Route path="/student" element={<ProtectedRoute roles={['student']}><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="leave-requests" element={<StudentLeaveRequests />} />
            <Route path="daily-logs" element={<DailyLogs />} />
            <Route path="weekly-reports" element={<StudentWeeklyReports />} />
          </Route>

          {/* Mentor */}
          <Route path="/mentor" element={<ProtectedRoute roles={['mentor']}><Layout /></ProtectedRoute>}>
            <Route path="dashboard" element={<MentorDashboard />} />
            <Route path="leave-requests" element={<MentorLeaveRequests />} />
            <Route path="evaluations" element={<MentorEvaluations />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#0d0e1a' }}>
              <div className="text-center">
                <h1 className="text-6xl font-bold mb-4" style={{ color: '#2e3150' }}>404</h1>
                <p className="mb-6" style={{ color: '#6b7194' }}>ไม่พบหน้าที่คุณต้องการ</p>
                <a href="/" className="px-6 py-3 text-white rounded-xl transition-all"
                  style={{ background: 'linear-gradient(135deg, #6d3ef2, #22d3ee)', boxShadow: '0 0 20px rgba(109, 62, 242, 0.3)' }}>กลับหน้าหลัก</a>
              </div>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
