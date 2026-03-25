import { google } from 'googleapis';

export const config = {
  runtime: 'nodejs'
};

export default async function handler(req, res) {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      subject: 'yeonhong.kim@metaht.kr', 
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: '19OrJtUPeDOH8jUnWvKTz-dwCmIyH9ub_yJnZYZXZHTI',
      // 전체 데이터를 불러올 범위
      range: 'Sheet1!A:E', 
    });

    const rows = response.data.values || [];

    // 2차원 배열 형태로 응답 (프론트엔드의 parseRowsToReports 함수가 이 배열을 처리함)
    res.status(200).json(rows);
  } catch (error) {
    console.error('FULL ERROR:', error);
    res.status(500).json({ error: error.message });
  }
}
