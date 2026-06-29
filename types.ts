export interface Report {
  category: '보고서' | '추가자료' | '차수별보고서' | '월마감예측';
  yearMonth: string;
  branch: string;
  round: string;
  url: string;
}
