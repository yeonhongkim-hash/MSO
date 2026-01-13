export interface Report {
  category: '보고서' | '추가자료'| '주차별 보고서';
  yearMonth: string;
  branch: string;
  url: string;
}
