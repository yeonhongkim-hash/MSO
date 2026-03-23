import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: '19OrJtUPeDOH8jUnWvKTz-dwCmIyH9ub_yJnZYZXZHTI',
      range: 'PasswordSheet!A1',
    });

    const password = response.data.values?.[0]?.[0] || '';

    res.status(200).json({ password });
  } catch (error) {
    console.error('FULL ERROR:', error);
    res.status(500).json({ error: error.message });
  }
}
