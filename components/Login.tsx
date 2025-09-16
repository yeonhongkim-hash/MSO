import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';

interface LoginProps {
  onLogin: (password: string) => void;
  isLoading: boolean;
  error: string | null;
}

const Login: React.FC<LoginProps> = ({ onLogin, isLoading, error }) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin(password);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onLogin(password);
    }
  };

  return (
    <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">MSO Reports</h1>
        <p className="text-gray-500 mt-1">Please enter the password to continue.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            placeholder="비밀번호 입력"
            disabled={isLoading}
          />
        </div>
        
        {error && <Alert message={error} />}

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                Verifying...
              </>
            ) : (
              'Access Sheet'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;
