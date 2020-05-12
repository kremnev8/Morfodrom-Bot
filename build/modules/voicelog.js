"use strict";
const util = require("../utilites.js");
const sprintf_js_1 = require("sprintf-js");
const Discord = require("discord.js");
const types = require("../index");
class VoiceLog {
    constructor() {
        this.name = 'voicelog';
        this.description = 'Вывести лог активности участников в голосовых чатах';
        this.args = 0;
        this.Authorize = true;
        this.Allow_DM = true;
        this.permlevel = 1;
    }
    execute(message, args) {
        const client = message.client;
        const totaldata = new Discord.Collection();
        const table = client.voicelogtxt;
        const index = table["index"];
        const now = new Date();
        let tempdate = new Date(now.getTime() - types.DAY_AS_MS * 6);
        for (let i = 0; i < 7; i++) {
            const date = `${tempdate.getDate()}.${tempdate.getMonth() + 1}.${tempdate.getFullYear() - 2000}`;
            const daytable = table[date];
            if (daytable) {
                index.forEach(userid => {
                    totaldata.set(userid, (totaldata.get(userid) ? totaldata.get(userid) : 0) + (daytable[userid] ? daytable[userid] : 0));
                });
            }
            tempdate = new Date(tempdate.getTime() + types.DAY_AS_MS);
        }
        let output = sprintf_js_1.sprintf(client.curentLang().voiceloghead);
        let page = 1;
        const outa = [];
        totaldata.each((time, userid) => {
            let timem = (time) / 60;
            let timeh = timem / 60;
            let timed = Math.floor(timeh / 24);
            timeh = Math.floor(timeh - timed * 24);
            timem = Math.floor(timem - timeh * 60 - timed * 24 * 60);
            const dmember = client.guild.members.cache.get(userid);
            let temp;
            if (!dmember || dmember.roles.highest.id != "395161000569208833") {
                temp = `<@${userid}> ${sprintf_js_1.sprintf(client.curentLang().timespent, `${util.pluralizeRu(timed, ["день", "дня", "дней"])}, ${util.pluralizeRu(timeh, ["час", "часа", "часов"])} и ${util.pluralizeRu(timem, ["минута", "минуты", "минут"])}`)}`;
            }
            else {
                temp = `${dmember.displayName} ${sprintf_js_1.sprintf(client.curentLang().timespent, `${util.pluralizeRu(timed, ["день", "дня", "дней"])}, ${util.pluralizeRu(timeh, ["час", "часа", "часов"])} и ${util.pluralizeRu(timem, ["минута", "минуты", "минут"])}`)}`;
            }
            if (output.length + temp.length >= 2000) {
                outa.push(output);
                output = sprintf_js_1.sprintf(client.curentLang().voicelogpage, ++page);
                output = output.concat('\n' + temp);
            }
            else {
                output = output.concat('\n' + temp);
            }
        });
        outa.push(output);
        if (outa.length == 1) {
            message.channel.send(output);
        }
        else {
            let i = 0;
            const id = setInterval(() => {
                message.channel.send(outa[i]);
                i++;
                if (i >= outa.length) {
                    clearInterval(id);
                }
            }, 500);
        }
        return "success";
    }
}
;
module.exports = new VoiceLog();
