"use strict";
const util = require("../utilites.js");
const sprintf_js_1 = require("sprintf-js");
class LogUsers {
    constructor() {
        this.name = 'loguser';
        this.description = 'Система отслеживания игроков клана Morfodrom\nУчтите что ники с пробелами не поддерживаются!';
        this.args = 4;
        this.guildOnly = true;
        this.Authorize = true;
        this.permlevel = 1;
        this.usage = '[Внутреигровой ник] [Дата вступления] [Пригласивший] (ID в дискорде или @игрок в дискорде)';
    }
    async execute(message, args) {
        const client = message.client;
        const nickname = args[0];
        const datein = `${args[1]} ${args[2]}`;
        const invitedby = args[3];
        let userid = args[4];
        let member;
        let gotid = true;
        if (!userid || userid.includes("@")) {
            member = message.mentions.members.first();
            if (member) {
                userid = member.id;
            }
            else {
                gotid = false;
            }
        }
        if (args.length > (gotid ? 5 : 4)) {
            message.reply(sprintf_js_1.sprintf(client.curentLang().invinput));
            return "error";
        }
        try {
            const dateinparse = util.EnDateParse(datein);
            const dcur = new Date();
            if (dcur.getTime() - dateinparse.getTime() < 0) {
                message.reply(sprintf_js_1.sprintf(client.curentLang().futuredate, datein));
                return "error";
            }
            if (nickname && dateinparse) {
                const dateloc = sprintf_js_1.sprintf('%02s.%02s.%02s %02s:%02s', dateinparse.getDate(), dateinparse.getMonth() + 1, dateinparse.getFullYear(), dateinparse.getHours(), dateinparse.getMinutes());
                let id = "";
                let username = "-";
                if (gotid) {
                    id = userid;
                    if (member) {
                        username = member.displayName;
                    }
                    else {
                        username = client.guild.members.cache.get(userid).displayName;
                    }
                }
                const values = [
                    [nickname, dateloc, client.clanRoles[0], invitedby, client.userStates[0], "-", id, username, "", "END"],
                ];
                const requestBody = {
                    values,
                };
                await client.sheets.spreadsheets.values.append({
                    spreadsheetId: client.sID,
                    range: "Участники!B2",
                    valueInputOption: "USER_ENTERED",
                    requestBody,
                });
                message.channel.send(sprintf_js_1.sprintf(client.curentLang().logsucs, nickname));
                return "success";
            }
        }
        catch (error) {
            message.reply(sprintf_js_1.sprintf(client.curentLang().invdate, datein));
            return "error";
        }
    }
}
;
module.exports = new LogUsers();
