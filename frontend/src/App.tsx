import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Public
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

// Business
import BusinessLayout from './layouts/BusinessLayout';
import BusinessDashboard from './pages/business/Dashboard';
import GuestEntry from './pages/business/GuestEntry';
import GuestRecords from './pages/business/GuestRecords';
import Submissions from './pages/business/Submissions';
import Inbox from './pages/business/Inbox';

// Admin
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import RegistrationApproval from './pages/admin/RegistrationApproval';
import Reports from './pages/admin/Reports';
import AdminMessages from './pages/admin/Messages';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'business' | 'admin' }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="/"
        element={
          <ProtectedRoute role="business">
            <BusinessLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<BusinessDashboard />} />
        <Route path="guest-records" element={<GuestRecords />} />
        <Route path="guest-entry" element={<GuestEntry />} />
        <Route path="submissions" element={<Submissions />} />
        <Route path="inbox" element={<Inbox />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="registrations" element={<RegistrationApproval />} />
        <Route path="reports" element={<Reports />} />
        <Route path="messages" element={<AdminMessages />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
