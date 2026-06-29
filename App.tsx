import React, { useState, useCallback } from 'react';
import Login from './components/Login';
import SpreadsheetViewer from './components/SpreadsheetViewer';
import ReportSelector from './components/ReportSelector';
import CategorySelector from './components/CategorySelector';
import { verifyPassword, getReportData } from './services/googleSheetService';
import type { Report } from './types';

// 1. 카테고리 타입에 '월마감예측' 추가 
type Category = '보고서' | '추가자료' | '차수별보고서' | '월마감예측';

const App: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [reports, setReports] = useState<Report[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = useCallback(async (password: string) => {
        if (!password) {
            setError("비밀번호를 입력해주세요.");
            return;
        }
        
        setIsLoading(true);
        setError(null);

        try {
            const isVerified = await verifyPassword(password);
            if (isVerified) {
                const reportData = await getReportData();
                setReports(reportData);
                setIsAuthenticated(true);
            } else {
                setError("비밀번호를 확인해주세요.");
                setIsAuthenticated(false);
            }
        } catch (e) {
            setError("오류가 발생했습니다. 다시 시도해주세요.");
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

    // 2. 뷰어에서 뒤로가기 버튼 클릭 시 로직 수정
    const handleBackFromViewer = () => {
        if (selectedCategory === '월마감예측') {
            // 월마감예측은 중간 옵션 선택(ReportSelector)이 없으므로, 
            // URL과 카테고리를 모두 날려 최상위 '카테고리 선택' 화면으로 직행합니다.
            setSelectedUrl(null);
            setSelectedCategory(null);
        } else {
            // 다른 보고서들은 옵션 선택 화면(ReportSelector)으로 돌아갑니다.
            setSelectedUrl(null);
        }
    };

    const handleBackToCategorySelector = () => {
        setSelectedCategory(null);
    }

    if (selectedUrl) {
        // 3. 수정된 핸들러(handleBackFromViewer)를 뷰어의 onBack에 연결
        return <SpreadsheetViewer url={selectedUrl} onBack={handleBackFromViewer} />;
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
            <Login onLogin={handleLogin} isLoading={isLoading} error={error} />
        </div>
    );
};

export default App;
