import React from 'react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleDemoLogin = async () => {
    try {
      await login();
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Personal CRM
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Manage your contacts and relationships
          </p>
        </div>
        
        <div className="mt-8 space-y-6">
          <div>
            <button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Demo Login'}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Demo mode - no authentication required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 