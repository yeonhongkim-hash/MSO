import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';

interface LoginProps {
  onLogin: (password: string) => void;
  isLoading: boolean;
  error: string | null;
}

const Login: React.FC<LoginProps> = ({ onLogin, isLoading, error }) => {
  const [password, setPassword] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // ⚠️ 허용할 도메인을 설정하세요. (예: gmail.com 또는 회사도메인.com)
  const ALLOWED_DOMAIN = "gmail.com"; 

  const handleGoogleSuccess = (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const email = decoded.email;

      if (email.endsWith(`@${ALLOWED_DOMAIN}`)) {
        setUserEmail(email);
        setIsEmailVerified(true);
      } else {
        alert(`접근 권한이 없습니다. @${ALLOWED_DOMAIN} 계정으로 로그인해주세요.`);
      }
    } catch (err) {
      alert("로그인 처리 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin(password);
  };

  return (
    <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">MSO Reports</h1>
        <p className="text-gray-500 mt-1">
          {isEmailVerified ? (
            <span className="text-blue-600 font-medium">{userEmail} 인증됨</span>
          ) : (
            "구글 도메인 인증이 필요합니다."
          )}
        </p>
      </div>

      <div className="space-y-6">
        {!isEmailVerified ? (
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert('구글 로그인에 실패했습니다.')}
              useOneTap
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="비밀번호 입력"
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full py-3 px-4 rounded-lg text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-colors font-medium flex justify-center items-center"
            >
              {isLoading ? <LoadingSpinner /> : 'Access Sheet'}
            </button>
          </form>
        )}

        {error && <Alert message={error} />}
      </div>
    </div>
  );
};

export default Login;
