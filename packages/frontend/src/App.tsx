import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ContactsPage from './pages/ContactsPage';

function App() {
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
          }
        />
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Layout>
                <DashboardPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/contacts"
          element={
            isAuthenticated ? (
              <Layout>
                <ContactsPage />
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/interactions"
          element={
            isAuthenticated ? (
              <Layout>
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-gray-900">Interactions</h1>
                  <div className="bg-white shadow rounded-lg p-6">
                    <p className="text-gray-600">Interactions management coming soon...</p>
                  </div>
                </div>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/tasks"
          element={
            isAuthenticated ? (
              <Layout>
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
                  <div className="bg-white shadow rounded-lg p-6">
                    <p className="text-gray-600">Tasks management coming soon...</p>
                  </div>
                </div>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/notes"
          element={
            isAuthenticated ? (
              <Layout>
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
                  <div className="bg-white shadow rounded-lg p-6">
                    <p className="text-gray-600">Notes management coming soon...</p>
                  </div>
                </div>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App; 