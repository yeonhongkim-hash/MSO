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

    // Start from 1 to skip the header row ('Category', 'YearMonth', 'Branch', 'URL')
    for (let i = 1; i < rows.length; i++) {
        const row = rows[i].trim();
        if (!row) continue; // Skip empty rows

        // A simple CSV parser assuming no commas within fields.
        const columns = row.split(',');

        if (columns.length >= 4) {
            const category = columns[0].trim() as '보고서' | '추가자료';
            const yearMonth = columns[1].trim();
            const branch = columns[2].trim();
            const url = columns[3].trim();
            
            if ((category === '보고서' || category === '추가자료') && yearMonth && branch && url) {
                 reports.push({ category, yearMonth, branch, url });
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
