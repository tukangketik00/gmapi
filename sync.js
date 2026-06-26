const { google } = require('googleapis');
const fs = require('fs');

const googleToken = process.env.GOOGLE_TOKEN;

if (!googleToken) {
    console.error("Token tidak ditemukan!");
    process.exit(1);
}

async function run() {
    try {
        // 1. Simpan token terbaru ke savetoken.json
        const tokenData = {
            access_token: googleToken,
            updated_at: new Date().toISOString()
        };
        fs.writeFileSync('savetoken.json', JSON.stringify(tokenData, null, 4));

        // 2. Ambil data Gmail
        const oauth2Client = new google.auth.OAuth2();
        oauth2Client.setCredentials({ access_token: googleToken });
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

        const resList = await gmail.users.messages.list({ userId: 'me', maxResults: 5 });
        const messages = resList.data.messages || [];
        const inboxData = [];

        for (let msg of messages) {
            const resMsg = await gmail.users.messages.get({ userId: 'me', id: msg.id });
            const headers = resMsg.data.payload.headers;
            const subject = headers.find(h => h.name === 'Subject')?.value || '(No Subject)';
            const from = headers.find(h => h.name === 'From')?.value || 'Unknown';

            inboxData.push({ id: msg.id, from, subject, snippet: resMsg.data.snippet || '' });
        }

        // 3. Simpan ke inbox.json
        fs.writeFileSync('inbox.json', JSON.stringify(inboxData, null, 4));
        console.log('Update JSON sukses!');
    } catch (error) {
        console.error('Gagal:', error);
        process.exit(1);
    }
}
run();
