import type { Report } from '../types';

// Cache
let cachedReports: Report[] | null = null;

/**
 * 배열 데이터 → Report 변환
 */
const parseRowsToReports = (rows: string[][]): Report[] => {
    const reports: Report[] = [];

    for (let i = 1; i < rows.length; i++) {
        const columns = rows[i];

        if (columns.length >= 5) {
            const category = columns[0] as '보고서' | '추가자료' | '주차별보고서';
            const yearMonth = columns[1];
            const week = columns[2];
            const branch = columns[3];
            const url = columns[4];

            if (category === '주차별보고서') {
                if (yearMonth && week && branch && url) {
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

        const reports = parseRowsToReports(data);
        cachedReports = reports;
        return reports;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};
