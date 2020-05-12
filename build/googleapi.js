"use strict";
const fs = require("fs");
const readline = require("readline");
const googleapis_1 = require("googleapis");
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';
function authorize(path) {
    let content = "";
    try {
        content = fs.readFileSync(`${path}/credentials.json`).toString();
    }
    catch (error) {
        global.logger.log('Error loading client secret file:', error);
        throw error;
    }
    let credentials = JSON.parse(content);
    const { client_secret, client_id, redirect_uris, } = credentials.installed;
    const oAuth2Client = new googleapis_1.google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    let token = "";
    try {
        token = fs.readFileSync(`${path}/${TOKEN_PATH}`).toString();
        oAuth2Client.setCredentials(JSON.parse(token));
        return oAuth2Client;
    }
    catch (error) {
        getNewToken(oAuth2Client, path);
        throw "Please reload the app.";
    }
}
function getSheets(path) {
    let auth = authorize(path);
    return googleapis_1.google.sheets({
        version: 'v4',
        auth,
    });
}
function getNewToken(oAuth2Client, path) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    global.logger.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
            if (err) {
                global.logger.error('Error while trying to retrieve access token', err);
                throw err;
            }
            oAuth2Client.setCredentials(token);
            try {
                fs.writeFileSync(`${path}/${TOKEN_PATH}`, JSON.stringify(token));
                global.logger.log('Token stored to', `${path}/${TOKEN_PATH}`);
            }
            catch (error) {
                global.logger.error(error);
                throw error;
            }
        });
    });
}
module.exports = { getSheets };
