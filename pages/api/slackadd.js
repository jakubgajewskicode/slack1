require('dotenv').config();

const { google } = require('googleapis');

const { GoogleAuth } = require('google-auth-library');

module.exports = async (req, res) => {
  try {
    const auth = new GoogleAuth({
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
      private_key_id: process.env.NEXT_PUBLIC_GOOGLE_PRIVATE_KEY,
      credentials: {
        type: 'service_account',
        client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
        private_key: process.env.NEXT_PUBLIC_GOOGLE_PROJECT_KEY,
        client_email: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_EMAIL,
        projectId: process.env.NEXT_PUBLIC_GOOGLE_PROJECT_ID,
      },
    });

    const authClient = await auth.getClient();

    const googleSheets = await google.sheets({
      version: 'v4',
      auth: authClient,
    });

    const text = JSON.stringify(req.body.text);

    const wordsArray = text.split(' ');

    try {
      await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId: process.env.NEXT_PUBLIC_SHEET_ID,
        range: 'Arkusz1!A:D',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',

        resource: {
          majorDimension: 'ROWS',
          values: [
            [
              `${wordsArray[0].replace('"', '')}`,
              `${wordsArray[1]}`,
              `${wordsArray[2]}`,
              `${wordsArray[3].replace('"', '')}`,
            ],
          ],
        },
      });
    } catch (err) {
      return err;
    }
  } catch (err) {
    res.send(err);
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Successfully added to spreadsheet',
    }),
  };
};
