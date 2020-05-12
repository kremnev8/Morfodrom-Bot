"use strict";
const sprintf_js_1 = require("sprintf-js");
class SetAlias {
    constructor() {
        this.name = 'setalias';
        this.description = 'Команда записывает id игрока в дискорде в базу данных.\nУчтите что ники с пробелами не поддерживаются!';
        this.args = 1;
        this.guildOnly = true;
        this.Authorize = true;
        this.permlevel = 1;
        this.aliases = ['setdiscordid'];
        this.usage = '[Ник игрока в Warframe] [ID в дискорде или @игрок в дискорде]';
    }
    async execute(message, args) {
        const client = message.client;
        const nickname = args[0];
        let userid = args[1];
        let member;
        if (!userid || userid.includes("@")) {
            member = message.mentions.members.first();
            if (member) {
                userid = member.id;
            }
            else {
                message.channel.send(sprintf_js_1.sprintf(client.curentLang().noping));
                return "error";
            }
        }
        if (nickname && userid) {
            const result = await client.sheets.spreadsheets.values.get({
                spreadsheetId: client.sID,
                range: "Участники!B2:B102",
            });
            const test = function (element, index, array) {
                return element[0] == this;
            };
            const table = result.data.values;
            const ind = table.findIndex(test, nickname);
            if (ind != -1) {
                const res = [
                    [userid]
                ];
                if (member) {
                    res[0][1] = member.displayName;
                }
                else {
                    res[0][1] = client.guild.members.cache.get(userid).displayName;
                }
                await client.sheets.spreadsheets.values.update({
                    spreadsheetId: client.sID,
                    range: `Участники!H${ind + 2}:I${ind + 2}`,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: res,
                    },
                });
                message.channel.send(sprintf_js_1.sprintf(client.curentLang().setaliassuccess, nickname));
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
module.exports = new SetAlias();
