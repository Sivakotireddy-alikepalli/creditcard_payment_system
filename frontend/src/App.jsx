import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CardsPage from './pages/CardsPage';
import AddCardPage from './pages/AddCardPage';
import MakePaymentPage from './pages/MakePaymentPage';
import TransactionsPage from './pages/TransactionsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppLayout><DashboardPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/cards" element={
            <ProtectedRoute>
              <AppLayout><CardsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/cards/add" element={
            <ProtectedRoute>
              <AppLayout><AddCardPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/payment" element={
            <ProtectedRoute>
              <AppLayout><MakePaymentPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/transactions" element={
            <ProtectedRoute>
              <AppLayout><TransactionsPage /></AppLayout>
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <AppLayout><AdminDashboardPage /></AppLayout>
            </ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
