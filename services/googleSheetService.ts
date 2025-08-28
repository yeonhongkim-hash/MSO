import type { Report } from '../types';

const MOCK_PASSWORD = "3030";

// This simulates the data from the management Google Sheet.
const MOCK_REPORTS: Report[] = [
  { category: '보고서', yearMonth: '2508', branch: '플란서울', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQtMAQ3wT__nOvpBzxPq_hF8ATrwnSOi41_8P3dCubo42E66F6GvXm6z7FfgwlGx47sYwoZGgEgKXTx/pubhtml'},
  { category: '보고서', yearMonth: '2508', branch: '플란부평', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRhi_DuiyolFx0CRiHokT0oEezTt0sgXSzgE0UCKl5jkvv6RuT6L4qDSJmAe_C_rQxpdw6jYeiyRP5M/pubhtml'},
  { category: '보고서', yearMonth: '2508', branch: '리팅서울', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9hLUJvU0pmzq-Emt7lACEwPpkkX17hwDK2jWmFTyIiMKV-b8v2ayIqKabGqHGyKB2YnoIWA8KrcML/pubhtml'},
  { category: '보고서', yearMonth: '2507', branch: '플란서울', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ_EXAMPLE_URL_FOR_2507_FLANSEOUL/pubhtml'},
  { category: '추가자료', yearMonth: '2507', branch: '리팅서울', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vT_ADDITIONAL_DATA_LITINGSEOUL_2507/pubhtml'},
];

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
 * Fetches the report link data.
 * @returns A promise that resolves to an array of report data.
 */
export const getReportData = async (): Promise<Report[]> => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency
    return MOCK_REPORTS;
};