import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';

interface LoginProps {
  onLoginSuccess: () => void; // 비밀번호 인자를 없애고 이름 변경
  isLoading: boolean;
  error: string | null;
}

const ALLOWED_DOMAINS = ["metaht.kr"]; 

const Login: React.FC<LoginProps> = ({ onLoginSuccess, isLoading, error }) => {
  const handleGoogleSuccess = (credentialResponse: any) => {
    try {
      const decoded: any = jwtDecode(credentialResponse.credential);
      const email = decoded.email.toLowerCase();

      const isAllowed = ALLOWED_DOMAINS.some(domain => 
        email.endsWith(`@${domain.trim()}`)
      );

      if (isAllowed) {
        // 도메인 인증 통과 시 바로 성공 처리 (비밀번호 생략)
        onLoginSuccess();
      } else {
        alert(`접근 권한이 없습니다.\n현재 계정: ${email}\n허용 도메인: ${ALLOWED_DOMAINS.join(", ")}`);
      }
    } catch (err) {
      alert("로그인 정보 해석 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">MSO Reports</h1>
        <p className="text-gray-500 mt-1">
          metaht.kr 계정으로 로그인해주세요.
        </p>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-3 px-4 rounded-lg text-white bg-blue-600">
            <LoadingSpinner />
            <span className="ml-2 font-medium">데이터 불러오는 중...</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => alert('구글 로그인에 실패했습니다.')}
              useOneTap
            />
          </div>
        )}

        {error && <Alert message={error} />}
      </div>
    </div>
  );
};

export default Login;
