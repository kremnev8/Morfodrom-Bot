"use strict";
const sprintf_js_1 = require("sprintf-js");
class SyncNames {
    constructor() {
        this.name = 'syncnames';
        this.description = 'Симхронизировать ники в дискорде и в таблице';
        this.args = 0;
        this.guildOnly = true;
        this.Authorize = true;
        this.permlevel = 1;
    }
    async execute(message, args) {
        const client = message.client;
        const result = await client.sheets.spreadsheets.values.get({
            spreadsheetId: client.sID,
            range: "Участники!H2:H102",
            majorDimension: "COLUMNS",
        });
        const table = result.data.values[0];
        const rettable = [];
        table.forEach(id => {
            if (id != "") {
                const member = client.guild.members.cache.get(id);
                if (member) {
                    rettable.push(member.displayName);
                }
                else {
                    rettable.push("-");
                }
            }
            else {
                rettable.push("-");
            }
        });
        const values = [rettable];
        await client.sheets.spreadsheets.values.update({
            spreadsheetId: client.sID,
            range: "Участники!I2:I102",
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                majorDimension: "COLUMNS",
                values,
            },
        });
        message.channel.send(sprintf_js_1.sprintf(client.curentLang().syncsuccess));
        return "success";
    }
}
;
module.exports = new SyncNames();
