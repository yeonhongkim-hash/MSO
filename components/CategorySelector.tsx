import React from 'react';

type Category = '보고서' | '추가자료' | '주차별보고서';

interface CategorySelectorProps {
  onSelect: (category: Category) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ onSelect }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">카테고리 선택</h1>
          <p className="text-gray-500 mt-1">조회할 항목의 카테고리를 선택해주세요.</p>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => onSelect('보고서')}
            className="w-full text-left p-6 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="보고서 조회하기"
          >
            <h2 className="text-lg font-semibold text-gray-800">보고서</h2>
            <p className="text-gray-600 mt-1">월별, 지점별 MSO 보고서를 조회합니다.</p>
          </button>
          <button
            onClick={() => onSelect('추가자료')}
            className="w-full text-left p-6 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="추가자료 조회하기"
          >
            <h2 className="text-lg font-semibold text-gray-800">추가자료</h2>
            <p className="text-gray-600 mt-1">월별, 지점별 추가자료를 조회합니다.</p>
          </button>
          <button
            onClick={() => onSelect('주차별보고서')}
            className="w-full text-left p-6 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="주차별 보고서 조회하기"
          >
            <h2 className="text-lg font-semibold text-gray-800">주차별 보고서</h2>
            <p className="text-gray-600 mt-1">주차별 인사이트 자료를 조회합니다.</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySelector;
