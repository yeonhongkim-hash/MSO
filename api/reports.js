import { google } from 'googleapis';

export const config = {
  runtime: 'nodejs'
};

export default async function handler(req, res) {
  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      subject: 'data@metaht.kr', 
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: '19OrJtUPeDOH8jUnWvKTz-dwCmIyH9ub_yJnZYZXZHTI',
      range: 'Sheet1!A1:E', 
    });

    // 해당 셀의 텍스트 값을 추출
    const password = response.data.values?.[0]?.[0] || '';

    // 프론트엔드가 기대하는 { password: '...' } 형태로 응답
    res.status(200).json({ row });
  } catch (error) {
    console.error('FULL ERROR:', error);
    res.status(500).json({ error: error.message });
  }
}
