import React, { useState, useMemo, useEffect } from 'react';
import type { Report } from '../types';

type Category = '보고서' | '추가자료' | '주차별보고서' | '월마감예측';

interface ReportSelectorProps {
  reports: Report[];
  selectedCategory: Category;
  onSelect: (url: string) => void;
  onBack: () => void;
}

const hospitalPrefixes = ['리팅', '셀팅', '플란', '다이트'];

const ReportSelector: React.FC<ReportSelectorProps> = ({ reports, selectedCategory, onSelect, onBack }) => {
  const title = `${selectedCategory} 조회`;
  const isWeeklyReport = selectedCategory === '주차별보고서';
  const isMonthlyForecast = selectedCategory === '월마감예측';

  const filteredReports = useMemo(() => {
    return reports.filter(r => r.category === selectedCategory);
  }, [reports, selectedCategory]);

  // 🔥 1. 월마감예측인 경우 자동 실행 (화면 렌더링 생략)
  useEffect(() => {
    if (isMonthlyForecast && filteredReports.length > 0) {
      const url = filteredReports[0]?.url;
      if (url) {
        onSelect(url);
      }
    }
  }, [isMonthlyForecast, filteredReports, onSelect]);

  const yearMonths = useMemo(() => {
    const uniqueYearMonths = new Set(filteredReports.map(r => r.yearMonth).filter(Boolean));
    return Array.from(uniqueYearMonths).sort().reverse();
  }, [filteredReports]);

  const getInitialYearMonth = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const currentYearMonth = `${year}${month}`;
    
    if (yearMonths.includes(currentYearMonth)) {
      return currentYearMonth;
    }
    return '';
  };
  
  const [selectedYearMonth, setSelectedYearMonth] = useState(getInitialYearMonth);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  const weeks = useMemo(() => {
    if (!isWeeklyReport || !selectedYearMonth) return [];
    const relevantReports = filteredReports.filter(r => r.yearMonth === selectedYearMonth);
    const uniqueWeeks = new Set(relevantReports.map(r => r.week).filter(Boolean));
    return Array.from(uniqueWeeks).sort();
  }, [filteredReports, selectedYearMonth, isWeeklyReport]);

  const availableHospitals = useMemo(() => {
    if (!selectedYearMonth) return [];
    if (isWeeklyReport && !selectedWeek) return [];

    const relevantReports = filteredReports.filter(r => {
        const matchYear = r.yearMonth === selectedYearMonth;
        const matchWeek = isWeeklyReport ? r.week === selectedWeek : true;
        return matchYear && matchWeek;
    });

    if (isWeeklyReport) {
        const uniqueBrands = new Set(relevantReports.map(r => r.branch));
        const sortOrder = ['리팅/셀팅', '플란', '다이트'];

        return Array.from(uniqueBrands).sort((a, b) => {
            const indexA = sortOrder.indexOf(a);
            const indexB = sortOrder.indexOf(b);
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.localeCompare(b);
        }); 
    }

    const availablePrefixes = new Set<string>();
    relevantReports.forEach(report => {
        const prefix = hospitalPrefixes.find(p => report.branch.startsWith(p));
        if (prefix) {
            availablePrefixes.add(prefix);
        }
    });

    return Array.from(availablePrefixes).sort((a, b) => hospitalPrefixes.indexOf(a) - hospitalPrefixes.indexOf(b));
  }, [filteredReports, selectedYearMonth, selectedWeek, isWeeklyReport]);

  const branches = useMemo(() => {
    if (isWeeklyReport) return [];
    if (!selectedYearMonth || !selectedHospital) return [];

    const locationOrder = ['서울', '청담', '부평', '검단', '수원', '동탄', '일산', '부산', '대구', '창원'];

    const getLocationIndex = (branchName: string) => {
      const location = locationOrder.find(l => branchName.includes(l));
      return location ? locationOrder.indexOf(location) : Infinity;
    };

    const uniqueBranches = Array.from(new Set(
        filteredReports
            .filter(r => r.yearMonth === selectedYearMonth && r.branch.startsWith(selectedHospital))
            .map(r => r.branch)
    ));

    return uniqueBranches.sort((a, b) => {
      const aLocationIndex = getLocationIndex(a);
      const bLocationIndex = getLocationIndex(b);
      return aLocationIndex - bLocationIndex;
    });
  }, [filteredReports, selectedYearMonth, selectedHospital, isWeeklyReport]);

  const handleYearMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedYearMonth(e.target.value);
      setSelectedWeek('');     
      setSelectedHospital(''); 
      setSelectedBranch('');   
  }

  const handleWeekChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedWeek(e.target.value);
      setSelectedHospital(''); 
  }

  const handleHospitalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedHospital(e.target.value);
      setSelectedBranch(''); 
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    let report: Report | undefined;

    if (isWeeklyReport) {
        report = filteredReports.find(
            r => r.yearMonth === selectedYearMonth && 
                 r.week === selectedWeek && 
                 r.branch === selectedHospital 
        );
    } else {
        report = filteredReports.find(
            r => r.yearMonth === selectedYearMonth && r.branch === selectedBranch
        );
    }

    if (report && report.url) {
      onSelect(report.url);
    }
  };

  const isSubmitDisabled = isWeeklyReport
    ? !selectedYearMonth || !selectedWeek || !selectedHospital
    : !selectedYearMonth || !selectedHospital || !selectedBranch;

  // 🔥 2. 월마감예측인 경우 폼 화면 대신 빈 화면(혹은 로딩 화면)을 표시하여 깜빡임 방지
  if (isMonthlyForecast) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
         {/* 선택사항: 로딩 텍스트나 스피너를 넣어도 좋습니다 */}
         <p className="text-gray-500">데이터를 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200 relative">
        <button
            onClick={onBack}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Back to category selection"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-500 mt-1">
            {isWeeklyReport 
                ? '조회할 연월, 주차, 병원명을 선택해주세요.' 
                : '조회할 항목의 연월, 병원명, 지점을 선택해주세요.'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. 연월 선택 */}
          <div>
            <label htmlFor="yearMonth" className="block text-sm font-medium text-gray-700 mb-2">연월</label>
            <select id="yearMonth" name="yearMonth" value={selectedYearMonth} onChange={handleYearMonthChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow">
              <option value="" disabled>연월 선택</option>
              {yearMonths.map(ym => <option key={ym} value={ym}>{ym}</option>)}
            </select>
          </div>

          {/* 2. 주차 선택 */}
          {isWeeklyReport && (
              <div>
                <label htmlFor="week" className="block text-sm font-medium text-gray-700 mb-2">주차</label>
                <select id="week" name="week" value={selectedWeek} onChange={handleWeekChange} disabled={!selectedYearMonth} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow disabled:bg-gray-100">
                  <option value="" disabled>주차 선택</option>
                  {weeks.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
          )}

          {/* 3. 병원 선택 */}
          <div>
            <label htmlFor="hospital" className="block text-sm font-medium text-gray-700 mb-2">병원명</label>
            <select id="hospital" name="hospital" value={selectedHospital} onChange={handleHospitalChange} disabled={isWeeklyReport ? !selectedWeek : !selectedYearMonth} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow disabled:bg-gray-100">
              <option value="" disabled>병원 선택</option>
              {availableHospitals.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>

          {/* 4. 지점 선택 */}
          {!isWeeklyReport && (
              <div>
                <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">지점명</label>
                <select id="branch" name="branch" value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)} disabled={!selectedHospital} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow disabled:bg-gray-100">
                  <option value="" disabled>지점 선택</option>
                  {branches.map(b => <option key={b} value={b}>{b.replace(selectedHospital, '')}</option>)}
                </select>
              </div>
          )}
          
          <div>
            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
            >
              조회하기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportSelector;
