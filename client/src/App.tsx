import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import { getStoredUser } from './hooks/useAuth';

const HomePage = lazy(() => import('./pages/Home/HomePage'));
const ToursPage = lazy(() => import('./pages/Tours/ToursPage'));
const TourDetailPage = lazy(() => import('./pages/TourDetail/TourDetailPage'));
const AboutPage = lazy(() => import('./pages/About/AboutPage'));
const LoginPage = lazy(() => import('./pages/Login/LoginPage'));
const AdminPage = lazy(() => import('./pages/Admin/AdminPage'));

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-[#0066cc] border-t-transparent rounded-full animate-spin" />
  </div>
);

function ProtectedRoute() {
  const user = getStoredUser();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <>
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin/*" element={<AdminPage />} />
          </Route>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="tours" element={<ToursPage />} />
            <Route path="tours/:id" element={<TourDetailPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
      <Toaster position="top-center" />
    </>
  );
}
