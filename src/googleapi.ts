import fs = require('fs');
import readline = require('readline');
import { google, sheets_v4 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

/**
 * Create an OAuth2 client with the given credentials
 */
function authorize(path: string): OAuth2Client
{

    let content: string = "";
    try
    {
        content = fs.readFileSync(`${path}/credentials.json`).toString();
    }
    catch (error)
    {
        global.logger.log('Error loading client secret file:', error);
        throw error;
    }
    // Authorize a client with credentials, then call the Google Sheets API.
    // authorize(JSON.parse(content), writeData);
    let credentials = JSON.parse(content);
    const
    {
        client_secret,
        client_id,
        redirect_uris,
    } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
    // Check if we have previously stored a token.
    let token: string = "";
    try
    {
        token = fs.readFileSync(`${path}/${TOKEN_PATH}`).toString();
        oAuth2Client.setCredentials(JSON.parse(token));
        return oAuth2Client;
    }
    catch (error)
    {
        getNewToken(oAuth2Client, path);
        throw "Please reload the app.";
    }
}



function getSheets(path: string): sheets_v4.Sheets
{
    let auth = authorize(path);
    return google.sheets(
    {
        version: 'v4',
        auth,
    });
}
export = { getSheets }


/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client: OAuth2Client, path: string): void
{
    const authUrl = oAuth2Client.generateAuthUrl(
    {
        access_type: 'offline',
        scope: SCOPES,
    });
    global.logger.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface(
    {
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) =>
    {
        rl.close();
        oAuth2Client.getToken(code, (err, token) =>
        {
            if (err) {
                global.logger.error('Error while trying to retrieve access token', err);
                throw err;
            }
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            try
            {
                fs.writeFileSync(`${path}/${TOKEN_PATH}`, JSON.stringify(token));
                global.logger.log('Token stored to', `${path}/${TOKEN_PATH}`);
            }
            catch (error)
            {
                global.logger.error(error);
                throw error;
            }
        });
    });
}