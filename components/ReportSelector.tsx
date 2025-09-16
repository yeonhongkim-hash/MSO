import React, { useState, useMemo } from 'react';
import type { Report } from '../types';

type Category = '보고서' | '추가자료';

interface ReportSelectorProps {
  reports: Report[];
  selectedCategory: Category;
  onSelect: (url: string) => void;
  onBack: () => void;
}

const ReportSelector: React.FC<ReportSelectorProps> = ({ reports, selectedCategory, onSelect, onBack }) => {
  const [selectedYearMonth, setSelectedYearMonth] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');

  const title = `${selectedCategory} 조회`;

  const filteredReports = useMemo(() => {
    return reports.filter(r => r.category === selectedCategory);
  }, [reports, selectedCategory]);

  const yearMonths = useMemo(() => {
    const uniqueYearMonths = new Set(filteredReports.map(r => r.yearMonth));
    // Sort descending (e.g., 2507, 2506, ...)
    return Array.from(uniqueYearMonths).sort().reverse();
  }, [filteredReports]);

  const branches = useMemo(() => {
    if (!selectedYearMonth) return [];

    const prefixOrder = ['리팅', '셀팅', '플란', '다이트'];
    const locationOrder = ['서울', '청담', '부평', '검단', '수원', '동탄', '일산', '부산', '대구', '창원'];

    const getSortKeys = (branchName: string) => {
      const prefix = prefixOrder.find(p => branchName.startsWith(p));
      const location = locationOrder.find(l => branchName.includes(l));

      // Assign a large number if not found to sort them to the end
      const prefixIndex = prefix ? prefixOrder.indexOf(prefix) : Infinity;
      const locationIndex = location ? locationOrder.indexOf(location) : Infinity;

      return { prefixIndex, locationIndex };
    };

    const uniqueBranches = Array.from(new Set(
        filteredReports
            .filter(r => r.yearMonth === selectedYearMonth)
            .map(r => r.branch)
    ));

    return uniqueBranches.sort((a, b) => {
      const aKeys = getSortKeys(a);
      const bKeys = getSortKeys(b);

      // 1. Sort by prefix order
      if (aKeys.prefixIndex !== bKeys.prefixIndex) {
        return aKeys.prefixIndex - bKeys.prefixIndex;
      }
      
      // 2. If prefix is the same, sort by location order
      return aKeys.locationIndex - bKeys.locationIndex;
    });
  }, [filteredReports, selectedYearMonth]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const report = filteredReports.find(
      r => r.yearMonth === selectedYearMonth && r.branch === selectedBranch
    );
    if (report) {
      onSelect(report.url);
    }
  };

  const handleYearMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedYearMonth(e.target.value);
      setSelectedBranch(''); // Reset branch on year/month change
  }

  const isSubmitDisabled = !selectedYearMonth || !selectedBranch;

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
          <p className="text-gray-500 mt-1">조회할 항목의 연월과 지점을 선택해주세요.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="yearMonth" className="block text-sm font-medium text-gray-700 mb-2">
              연월
            </label>
            <select
              id="yearMonth"
              name="yearMonth"
              value={selectedYearMonth}
              onChange={handleYearMonthChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            >
              <option value="" disabled>연월 선택</option>
              {yearMonths.map(ym => (
                <option key={ym} value={ym}>{ym}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="yearMonth" className="block text-sm font-medium text-gray-700 mb-2">
              병원명
            </label>
            <select
              id="branch"
              name="branch"
              value={selectedBranch}
              onChange={handleYearMonthChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            >
              <option value="" disabled>병원 선택</option>
              {yearMonths.map(ym => (
                <option key={ym} value={ym}>{ym}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
              지점명
            </label>
            <select
              id="branch"
              name="branch"
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              disabled={!selectedYearMonth}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow disabled:bg-gray-100"
            >
              <option value="" disabled>지점 선택</option>
              {branches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        
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
