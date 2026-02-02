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

  // 허용할 도메인을 설정하세요. (예: gmail.com 또는 회사도메인.com)
  // Login.tsx 내부

// 1. 도메인 목록을 정확한 배열 형태로 작성 (공백 주의)
const ALLOWED_DOMAINS = ["gmail.com", "metaht.kr"]; 

const handleGoogleSuccess = (credentialResponse: any) => {
  try {
    const decoded: any = jwtDecode(credentialResponse.credential);
    const email = decoded.email.toLowerCase(); // 소문자로 변환하여 비교 (보안상 권장)

    // 2. some 함수를 사용하여 정확히 끝자리가 일치하는지 확인
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      email.endsWith(`@${domain.trim()}`)
    );

    if (isAllowed) {
      setUserEmail(email);
      setIsEmailVerified(true); // 성공 시 비밀번호 창이 나타남
    } else {
      // 실패 시 알림창에 현재 로그인 시도한 이메일을 표시해서 디버깅하기 쉽게 수정
      alert(`접근 권한이 없습니다.\n현재 계정: ${email}\n허용 도메인: ${ALLOWED_DOMAINS.join(", ")}`);
    }
  } catch (err) {
    alert("로그인 정보 해석 중 오류가 발생했습니다.");
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



