import { useAuthStore } from '../stores/authStore';

const LoginPage = () => {
  const { login } = useAuthStore();

  const handleDemoLogin = () => {
    // Demo login for now - will implement Google OAuth later
    const demoUser = {
      id: 'demo-user-1',
      email: 'demo@example.com',
      name: 'Demo User',
      avatarUrl: 'https://via.placeholder.com/40'
    };
    
    const demoToken = 'demo-token-123';
    
    login(demoUser, demoToken);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Personal CRM
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your Personal CRM
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="text-center">
            <button 
              onClick={handleDemoLogin}
              className="btn btn-primary w-full"
            >
              Demo Login
            </button>
          </div>
          <div className="text-center text-sm text-gray-500">
            Your personal CRM for managing contacts and relationships
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 