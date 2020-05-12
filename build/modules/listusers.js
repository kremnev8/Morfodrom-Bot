"use strict";
const sprintf_js_1 = require("sprintf-js");
class ListUsers {
    constructor() {
        this.name = 'listusers';
        this.description = 'Список всех пользователей находящихся в базе данных';
        this.guildOnly = true;
        this.Authorize = true;
        this.permlevel = 1;
    }
    async execute(message, args) {
        const client = message.client;
        let users = "";
        let result = await client.sheets.spreadsheets.values.get({
            spreadsheetId: client.sID,
            range: "Участники!B2:B102",
        });
        let table = result.data.values;
        for (let i = 0; i < table.length; i++) {
            users = `${users}${users == "" ? "" : ","} ${table[i][0]}`;
        }
        if (users != "") {
            message.channel.send(sprintf_js_1.sprintf(client.curentLang().alltheusers, users));
            return "success";
        }
    }
}
;
module.exports = new ListUsers();
