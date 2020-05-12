"use strict";
const util = require("../utilites.js");
const sprintf_js_1 = require("sprintf-js");
const Discord = require("discord.js");
class UserInfo {
    constructor() {
        this.name = 'userinfo';
        this.description = 'Информация о участнике клана\nУчтите что ники с пробелами не поддерживаются';
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
                    range: `Участники!B${ind + 2}:J${ind + 2}`,
                });
                const data = result1.data.values[0];
                const infomsg = new Discord.MessageEmbed()
                    .setColor('#0000ee')
                    .setTitle(`${nickname}`);
                const joindate = util.RuDateParse(data[1]);
                try {
                    if (data[6]) {
                        infomsg.setDescription(`${data[2]} - <@${data[6]}>`);
                    }
                    else {
                        infomsg.setDescription(`${data[2]} - Ник дискорда неизвестен!`);
                    }
                    infomsg.addField(client.curentLang().infoemb1, `${joindate.toLocaleString('ru')}`, true);
                    infomsg.addField(client.curentLang().infoemb2, `${data[3]}`, true);
                    infomsg.addField('\u200b', '\u200b', false);
                    infomsg.addField(client.curentLang().infoemb5, data[4], true);
                    if (data[5] != "-") {
                        infomsg.addField(client.curentLang().infoemb6, data[5], true);
                    }
                    else {
                        infomsg.addField('\u200b', '\u200b', true);
                    }
                    const today = new Date();
                    let timem = (today.getTime() - joindate.getTime()) / 1000 / 60;
                    let timeh = timem / 60;
                    let timed = Math.floor(timeh / 24);
                    timeh = Math.floor(timeh - timed * 24);
                    timem = Math.floor(timem - timeh * 60 - timed * 24 * 60);
                    infomsg.addField(client.curentLang().infoemb3, `${util.pluralizeRu(timed, ["день", "дня", "дней"])}, ${util.pluralizeRu(timeh, ["час", "часа", "часов"])} и ${util.pluralizeRu(timem, ["минута", "минуты", "минут"])}`);
                    if (data[8])
                        infomsg.addField(client.curentLang().infoemb4, `${data[8]}`, true);
                    message.channel.send(infomsg);
                    return "success";
                }
                catch (error) {
                    message.channel.send(sprintf_js_1.sprintf(client.curentLang().dateincorrect));
                    return "error";
                }
            }
        }
        message.channel.send(sprintf_js_1.sprintf(client.curentLang().infonotfound, nickname));
        return "error";
    }
}
;
module.exports = new UserInfo();
