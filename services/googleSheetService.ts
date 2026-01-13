import type { Report } from '../types';

// These URLs point to a Google Sheet and export it as CSV.
// This is a more robust method than "Publish to the web" and is less likely to cause CORS errors.
// The sheet must be shared with "Anyone with the link".
// Sheet ID: 19OrJtUPeDOH8jUnWvKTz-dwCmIyH9ub_yJnZYZXZHTI
const SPREADSHEET_ID = '19OrJtUPeDOH8jUnWvKTz-dwCmIyH9ub_yJnZYZXZHTI';
const BASE_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`;

// URL for the password sheet (gid=1372673437)
const PASSWORD_CSV_URL = `${BASE_URL}&gid=1372673437`;

// URL for the main reports data sheet (gid=0)
const PUBLISHED_CSV_URL = `${BASE_URL}&gid=0`;

// Cache to avoid re-fetching the sheet data on every interaction.
let cachedReports: Report[] | null = null;

/**
 * Parses CSV text data into an array of Report objects.
 * @param csvText The raw CSV string from the published Google Sheet.
 * @returns An array of reports.
 */
const parseCsvToReports = (csvText: string): Report[] => {
    const reports: Report[] = [];
    const rows = csvText.trim().split('\n');

    // Start from 1 to skip the header row ('Category', 'YearMonth', 'Week', 'Branch', 'URL')
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue; // Skip empty rows

        const columns = row.split(',');

        // The structure: Category (0), YearMonth (1), Week (2), Branch (3), URL (4)
        if (columns.length >= 5) {
            const category = columns[0].trim() as '보고서' | '추가자료' | '주차별 보고서';
            const yearMonth = columns[1].trim();
            const week = columns[2].trim();
            const branch = columns[3].trim(); // 병원명(브랜드) 또는 병원명&지점명
            const url = columns[4].trim();
            
            // 1. '주차별 보고서'인 경우: Week, Branch, URL 모두 필수
            // Branch에는 '리팅/셀팅', '다이트', '플란' 등이 들어옵니다.
            if (category === '주차별 보고서') {
                if (yearMonth && week && branch && url) {
                    reports.push({ 
                        category, 
                        yearMonth, 
                        week, 
                        branch, 
                        url 
                    });
                }
            } 
            // 2. '보고서' 또는 '추가자료'인 경우: Branch, URL 필수 (Week는 무시)
            // Branch에는 '병원명&지점명'이 들어옵니다.
            else if ((category === '보고서' || category === '추가자료')) {
                if (yearMonth && branch && url) {
                    reports.push({ 
                        category, 
                        yearMonth, 
                        branch, 
                        week: '', // 일반 보고서는 주차 정보가 없으므로 빈 문자열
                        url 
                    });
                }
            }
        }
    }
    return reports;
};

/**
 * Fetches the master password from the Google Sheet.
 * @returns The master password.
 */
const getMasterPassword = async (): Promise<string> => {
    try {
        // Use { cache: 'no-store' } to prevent browser caching and ensure the latest password is fetched.
        // Add a timestamp to the URL to ensure the request is not cached by intermediate proxies.
        const url = `${PASSWORD_CSV_URL}&t=${new Date().getTime()}`;
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
            console.error('Failed to fetch password from Google Sheet. Make sure the sheet is shared with "Anyone with the link".');
            throw new Error('Could not retrieve password sheet.');
        }
        const password = await response.text();
        return password.trim(); // The CSV for a single cell is just its content. Trim any whitespace/newlines.
    } catch (error) {
        console.error("Error fetching password:", error);
        throw new Error('Could not verify password due to a network error.');
    }
}


/**
 * Verifies the password by fetching the correct one from a Google Sheet.
 * @param inputPassword The password from the user.
 * @returns True if correct, false otherwise.
 */
export const verifyPassword = async (inputPassword: string): Promise<boolean> => {
  const masterPassword = await getMasterPassword();
  return inputPassword === masterPassword;
};

/**
 * Fetches and parses the report link data from the published Google Sheet.
 * It caches the result to improve performance.
 * @returns A promise that resolves to an array of report data.
 */
export const getReportData = async (): Promise<Report[]> => {
    if (cachedReports) {
        return Promise.resolve(cachedReports);
    }
    
    try {
        const response = await fetch(PUBLISHED_CSV_URL);
        if (!response.ok) {
            console.error('Failed to fetch Google Sheet data. Make sure it is shared with "Anyone with the link".');
            throw new Error('Could not load report data.');
        }
        const csvText = await response.text();
        const reports = parseCsvToReports(csvText);
        cachedReports = reports; // Cache the parsed data
        return reports;
    } catch (error) {
        console.error("Error fetching or parsing sheet data:", error);
        // In case of error, return an empty array so the app doesn't crash.
        return [];
    }
};
