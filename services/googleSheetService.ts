import type { Report } from '../types';

const MOCK_PASSWORD = "3030";

// This URL points to the Google Sheet "Published to the web" as a CSV.
// This allows the app to fetch live data without complex authentication.
// Sheet ID: 19OrJtUPeDOH8jUnWvKTz-dwCmIyH9ub_yJnZYZXZHTI
const PUBLISHED_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSnI4B4FLE1DS6FBZuPcC688B0TsFaDXoFw4fpCfVSJlmIFozFNPNRUgJpsnJW3c986e8X2c9k_n-18/pub?gid=0&single=true&output=csv';

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
 * Verifies the password.
 * @param inputPassword The password from the user.
 * @returns True if correct, false otherwise.
 */
export const verifyPassword = async (inputPassword: string): Promise<boolean> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency
  return inputPassword === MOCK_PASSWORD;
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
            console.error('Failed to fetch Google Sheet data. Make sure it is "Published to the web" as a CSV.');
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
