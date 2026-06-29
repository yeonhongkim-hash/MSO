export interface Report {
  category: '보고서' | '추가자료' | '차수별보고서' | '월마감예측' | '주차별보고서';
  yearMonth: string;
  branch: string;
  round: string;
  /** @deprecated week 필드는 round로 대체됨 */
  week?: string;
  url: string;
}

export const isRoundReportCategory = (category: string) =>
  category === '차수별보고서' || category === '주차별보고서';

export const getReportRound = (report: Report) =>
  report.round || report.week || '';

export const matchesReportCategory = (report: Report, selectedCategory: Report['category']) => {
  if (selectedCategory === '차수별보고서') {
    return isRoundReportCategory(report.category);
  }
  return report.category === selectedCategory;
};
