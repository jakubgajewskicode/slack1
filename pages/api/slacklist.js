require('dotenv').config();

const { google } = require('googleapis');

const { GoogleAuth } = require('google-auth-library');

const Axios = require('axios');

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

    const slackHook = process.env.NEXT_PUBLIC_SLACK_HOOK;

    const getAllRow = await googleSheets.spreadsheets.values.get({
      auth,
      spreadsheetId: process.env.NEXT_PUBLIC_SHEET_ID,
      range: 'Arkusz1!A2:D100',
    });

    await getAllRow.data.values.map((item) => {
      Axios.post(`https://hooks.slack.com/services/${slackHook}`, {
        headers: { 'Content-Type': 'application/json' },
        attachments: [
          {
            color: '#f2c744',
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Login:*  ${item[0]}  *Password:* ${item[1]}   *Link:*  ${item[2]}  *Description:*  ${item[3]} `,
                },
              },
              {
                type: 'divider',
              },
            ],
          },
        ],
      });
    });
    res.status(200).send('Successfully listed');
  } catch (err) {
    res.send(err);
  }
};
