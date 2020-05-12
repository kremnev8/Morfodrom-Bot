"use strict";
const sprintf_js_1 = require("sprintf-js");
class Purge {
    constructor() {
        this.name = 'purge';
        this.description = 'Удалить пользователя из системы';
        this.args = 1;
        this.guildOnly = true;
        this.Authorize = true;
        this.permlevel = 1;
        this.usage = '[Внутреигровой ник]';
    }
    async execute(message, args) {
        const client = message.client;
        const nickname = args[0];
        if (nickname) {
            let result = await client.sheets.spreadsheets.values.get({
                spreadsheetId: client.sID,
                range: "Участники!B2:B102",
            });
            const test = function (element, index, array) {
                return element[0] == this;
            };
            const table = result.data.values;
            const ind = table.findIndex(test, nickname);
            if (ind != -1) {
                const userData = await client.sheets.spreadsheets.values.get({
                    spreadsheetId: client.sID,
                    range: `Участники!B${ind + 2}:${client.lastLetter}${ind + 2}`,
                });
                const userID = userData.data.values[6];
                const member = client.guild.members.cache.get(userID);
                if (member) {
                    if (member.roles.cache.has("394957292581158923")) {
                        global.logger.info(`${member.displayName} no longer is in clan!`);
                        member.roles.remove('394957292581158923', 'Участник более не состоит в клане Warframe');
                        member.roles.add("586270815218171918");
                    }
                }
                const dataBuffer = await client.sheets.spreadsheets.values.get({
                    spreadsheetId: client.sID,
                    range: `Участники!B${ind + 3}:${client.lastLetter}103`,
                });
                let data = dataBuffer.data.values;
                if (!data)
                    data = [];
                data[data.length] = ["", "", "", "", "", "", "", "", "", ""];
                await client.sheets.spreadsheets.values.update({
                    spreadsheetId: client.sID,
                    range: `Участники!B${ind + 2}:${client.lastLetter}102`,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: data,
                    },
                });
                message.channel.send(sprintf_js_1.sprintf(client.curentLang().purge, nickname));
                return "success";
            }
            else {
                message.channel.send(sprintf_js_1.sprintf(client.curentLang().infonotfound, nickname));
                return "error";
            }
        }
    }
}
;
module.exports = new Purge();
