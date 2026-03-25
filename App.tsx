import React, { useState, useCallback } from 'react';
import Login from './components/Login';
import SpreadsheetViewer from './components/SpreadsheetViewer';
import ReportSelector from './components/ReportSelector';
import CategorySelector from './components/CategorySelector';
// verifyPassword는 이제 필요 없으므로 삭제합니다.
import { getReportData } from './services/googleSheetService'; // 경로는 실제 프로젝트에 맞게 확인해주세요!
import type { Report } from './types';

type Category = '보고서' | '추가자료'| '주차별보고서'; // 띄어쓰기 주의

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [reports, setReports] = useState<Report[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 구글 로그인 성공 시 바로 실행되는 함수
    const handleLoginSuccess = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // 비밀번호 확인 없이 바로 시트 데이터를 가져옵니다.
            const reportData = await getReportData();
            setReports(reportData);
            setIsAuthenticated(true);
        } catch (e) {
            setError("데이터를 불러오는 중 오류가 발생했습니다.");
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleSelectCategory = (category: Category) => {
        setSelectedCategory(category);
    };

    const handleSelectReport = (url: string) => {
        setSelectedUrl(url);
    };

    const handleBackToReportSelector = () => {
        setSelectedUrl(null);
    };

    const handleBackToCategorySelector = () => {
        setSelectedCategory(null);
    }

    if (selectedUrl) {
        return <SpreadsheetViewer url={selectedUrl} onBack={handleBackToReportSelector} />;
    }

    if (isAuthenticated) {
        if (!selectedCategory) {
            return <CategorySelector onSelect={handleSelectCategory} />
        }
        return <ReportSelector 
            reports={reports} 
            selectedCategory={selectedCategory}
            onSelect={handleSelectReport} 
            onBack={handleBackToCategorySelector}
        />;
    }
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Login onLoginSuccess={handleLoginSuccess} isLoading={isLoading} error={error} />
        </div>
    );
};

export default App;
