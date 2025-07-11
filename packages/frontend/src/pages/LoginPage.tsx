const LoginPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Personal CRM
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in with your Microsoft 365 account
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="text-center">
            <button className="btn btn-primary w-full">
              Sign in with Microsoft
            </button>
          </div>
          <div className="text-center text-sm text-gray-500">
            Coming soon - Microsoft 365 integration in development
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 