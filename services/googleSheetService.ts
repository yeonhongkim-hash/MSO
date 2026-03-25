import type { Report } from '../types';

// Cache
let cachedReports: Report[] | null = null;

/**
 * 배열 데이터 → Report 변환
 */
const parseRowsToReports = (rows: string[][]): Report[] => {
    const reports: Report[] = [];

    // 안전장치: rows가 배열이 아닐 경우 빈 배열 반환
    if (!Array.isArray(rows)) return reports;

    for (let i = 1; i < rows.length; i++) {
        const columns = rows[i];

        // 데이터가 최소 4개(카테고리, 연월, 지점, URL) 이상일 때만 처리
        if (columns.length >= 4) {
            const category = columns[0] as '보고서' | '추가자료' | '주차별보고서';
            const yearMonth = columns[1];
            
            let week = '';
            let branch = '';
            let url = '';

            // 주차별보고서는 데이터가 5개(Week 포함)
            // 일반 보고서/추가자료는 Week 열이 없어서 4개일 수 있음을 대비
            if (category === '주차별보고서' && columns.length >= 5) {
                week = columns[2];
                branch = columns[3];
                url = columns[4];
            } else if (columns.length === 4) {
                // Week 칸 자체가 생략되어 길이가 4인 경우 하나씩 당겨서 할당
                branch = columns[2];
                url = columns[3];
            } else {
                // Week 칸이 빈 문자열("")로 들어와서 길이가 5인 경우
                week = columns[2] || '';
                branch = columns[3];
                url = columns[4];
            }

            // 조건에 맞게 객체 배열에 추가
            if (category === '주차별보고서') {
                if (yearMonth && branch && url) { // week는 1, 2, 3 등 값이 있을 테지만 방어적으로 처리
                    reports.push({ category, yearMonth, week, branch, url });
                }
            } else {
                if (yearMonth && branch && url) {
                    reports.push({ category, yearMonth, branch, week: '', url });
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
export const getReportData = async (): Promise<Report[]> => {
    if (cachedReports) return cachedReports;

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
