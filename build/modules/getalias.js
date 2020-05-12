"use strict";
const sprintf_js_1 = require("sprintf-js");
var data;
class GetAlias {
    constructor() {
        this.name = 'getalias';
        this.description = 'Информация о никах других игроков в дискорде.\nУчтите что ники с пробелами не поддерживаются!';
        this.args = 1;
        this.guildOnly = true;
        this.usage = '[Имя игрока в Warframe]';
        this.aliases = ['whoareyou'];
        this.permlevel = 0;
    }
    async execute(message, args) {
        const client = message.client;
        const nickname = args[0];
        if (nickname) {
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
                const result1 = await client.sheets.spreadsheets.values.get({
                    spreadsheetId: client.sID,
                    range: `Участники!H${ind + 2}`,
                });
                const id = result1.data.values[0][0];
                message.channel.send(sprintf_js_1.sprintf(client.curentLang().userfound, id));
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
module.exports = new GetAlias();
