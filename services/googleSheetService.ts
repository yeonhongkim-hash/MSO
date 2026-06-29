import type { Report } from '../types';

// Cache
let cachedReports: Report[] | null = null;

type ReportCategory = '보고서' | '추가자료' | '차수별보고서' | '월마감예측';

const normalizeCategory = (raw: string): ReportCategory | null => {
    const value = (raw ?? '').trim();
    if (value === '주차별보고서') return '차수별보고서';
    if (value === '보고서' || value === '추가자료' || value === '차수별보고서' || value === '월마감예측') {
        return value;
    }
    return null;
};

/**
 * 배열 데이터 → Report 변환
 */
const parseRowsToReports = (rows: string[][]): Report[] => {
    const reports: Report[] = [];

    // 안전장치: rows가 배열이 아닐 경우 빈 배열 반환
    if (!Array.isArray(rows)) return reports;

    for (let i = 1; i < rows.length; i++) {
        const columns = rows[i];

        // '월마감예측'은 카테고리와 URL만 존재할 수 있으므로, 최소 2개 이상일 때부터 처리
        if (columns.length >= 2) {
            const category = normalizeCategory(columns[0]);
            if (!category) continue;

            // 1. 월마감예측 처리: 카테고리와 URL만 존재
            if (category === '월마감예측') {
                // 빈 셀 생략 여부와 관계없이 배열의 가장 마지막 값을 URL로 간주
                const url = columns[columns.length - 1] || '';
                
                if (url) {
                    // 나머지 필드는 빈 문자열로 안전하게 처리
                    reports.push({ category, yearMonth: '', round: '', branch: '', url });
                }
                continue; // 아래의 기존 로직은 건너뛰고 다음 행으로 이동
            }

            // 2. 기존 보고서/추가자료/차수별보고서 처리: 최소 4개(카테고리, 연월, 지점, URL) 이상 필요
            if (columns.length >= 4) {
                const yearMonth = columns[1];
                
                let round = '';
                let branch = '';
                let url = '';

                // 차수별보고서는 데이터가 5개(차수 포함)
                // 일반 보고서/추가자료는 차수 열이 없어서 4개일 수 있음을 대비
                if (category === '차수별보고서' && columns.length >= 5) {
                    round = columns[2];
                    branch = columns[3];
                    url = columns[4];
                } else if (columns.length === 4) {
                    // 차수 칸 자체가 생략되어 길이가 4인 경우 하나씩 당겨서 할당
                    branch = columns[2];
                    url = columns[3];
                } else {
                    // 차수 칸이 빈 문자열("")로 들어와서 길이가 5인 경우
                    round = columns[2] || '';
                    branch = columns[3];
                    url = columns[4];
                }

                // 조건에 맞게 객체 배열에 추가
                if (category === '차수별보고서') {
                    if (yearMonth && branch && url) { 
                        reports.push({ category, yearMonth, round, branch, url });
                    }
                } else {
                    if (yearMonth && branch && url) {
                        reports.push({ category, yearMonth, branch, round: '', url });
                    }
                }
            }
        }
    }

    return reports;
};

/**
 * 비밀번호 검증 (API 호출)
 */
export const verifyPassword = async (inputPassword: string): Promise<boolean> => {
    try {
        const res = await fetch('/api/password');
        const data = await res.json();
        return inputPassword === data.password;
    } catch (error) {
        console.error(error);
        return false;
    }
};

/**
 * 보고서 데이터 가져오기 (API 호출)
 */
export const clearReportCache = () => {
    cachedReports = null;
};

export const getReportData = async (forceRefresh = false): Promise<Report[]> => {
    if (cachedReports && !forceRefresh) return cachedReports;

    try {
        const response = await fetch('/api/reports');
        const data = await response.json();

        // 🚨 중요 수정: data 자체가 아니라 data.rows를 전달해야 합니다.
        // 만약 다른 이유로 배열 자체가 왔을 경우를 대비해 data.rows || data 로 처리합니다.
        const rowsArray = data.rows || data;

        const reports = parseRowsToReports(rowsArray);
        cachedReports = reports;
        return reports;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};
