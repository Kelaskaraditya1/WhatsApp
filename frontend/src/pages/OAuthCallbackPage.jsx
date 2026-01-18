import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/authAPI';
import { MdRefresh, MdError } from 'react-icons/md';

const OAuthCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');
      const errorMessage = searchParams.get('message');

      if (errorParam) {
        setError(errorMessage || 'OAuth authentication failed. Please try again.');
        return;
      }

      if (token) {
        // Store the token
        localStorage.setItem('token', token);
        localStorage.setItem('tokenType', 'Bearer');

        // Fetch user details
        try {
          const response = await authAPI.getCurrentUser(token);
          
          if (response.success && response.data) {
            localStorage.setItem('user', JSON.stringify(response.data));
            navigate('/home');
          } else {
            setError('Failed to fetch user details. Please try again.');
            localStorage.removeItem('token');
            localStorage.removeItem('tokenType');
          }
        } catch (err) {
          setError('An error occurred. Please try again.');
          localStorage.removeItem('token');
          localStorage.removeItem('tokenType');
        }
      } else {
        setError('No authentication token received. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <MdError className="text-red-500 text-3xl" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Authentication Failed
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <MdRefresh className="text-emerald-500 text-4xl animate-spin" />
        <p className="text-slate-500 dark:text-slate-400">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
