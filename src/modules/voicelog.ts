import util = require('../utilites.js');
import { sprintf } from 'sprintf-js';
import Discord = require('discord.js');
import * as types from '../index';


class VoiceLog implements types.ICommandModule {
    name = 'voicelog';
    description = 'Вывести лог активности участников в голосовых чатах';
    args = 0;
    Authorize = true;
    Allow_DM = true;
    permlevel = 1;

    execute(message: Discord.Message, args: string[]): types.ResultLike {
        const client: types.AClient = message.client as types.AClient;
        // let nickname = args[0];

        const totaldata: Discord.Collection<string, number> = new Discord.Collection();
        const table: types.VoiceFile = client.voicelogtxt;
        const index: string[] = table["index"];

        const now = new Date();
        let tempdate = new Date(now.getTime() - types.DAY_AS_MS * 6);

        for (let i = 0; i < 7; i++) {
            const date = `${tempdate.getDate()}.${tempdate.getMonth()+1}.${tempdate.getFullYear()-2000}`
            const daytable: types.Object<number>  = table[date];

            if (daytable) {
                index.forEach(userid => {
                    totaldata.set(userid, (totaldata.get(userid) ? totaldata.get(userid) : 0) + (daytable[userid] ? daytable[userid] : 0))
                });
            }
            tempdate = new Date(tempdate.getTime() + types.DAY_AS_MS);
        }

        let output: string = sprintf(client.curentLang().voiceloghead);
        let page: number = 1;
        const outa: string[] = [];

        totaldata.each((time, userid) => {

            let timem = (time) / 60;
            let timeh = timem / 60;
            let timed = Math.floor(timeh / 24);
            timeh = Math.floor(timeh - timed * 24);
            timem = Math.floor(timem - timeh * 60 - timed * 24 * 60);

            const dmember = client.guild.members.cache.get(userid)
            let temp: string;
            if (!dmember || dmember.roles.highest.id != "395161000569208833") {
                temp = `<@${userid}> ${sprintf(client.curentLang().timespent, `${util.pluralizeRu(timed, ["день", "дня", "дней"])}, ${util.pluralizeRu(timeh, ["час", "часа", "часов"])} и ${util.pluralizeRu(timem, ["минута", "минуты", "минут"])}`)}`;
            } else {
                temp = `${dmember.displayName} ${sprintf(client.curentLang().timespent, `${util.pluralizeRu(timed, ["день", "дня", "дней"])}, ${util.pluralizeRu(timeh, ["час", "часа", "часов"])} и ${util.pluralizeRu(timem, ["минута", "минуты", "минут"])}`)}`;
            }
            if (output.length + temp.length >= 2000) {
                outa.push(output);
                output = sprintf(client.curentLang().voicelogpage, ++page);
                output = output.concat('\n' + temp);
            } else {
                output = output.concat('\n' + temp);
            }
        });
        outa.push(output)
        if (outa.length == 1) {
            message.channel.send(output);
        } else {
            let i = 0;
            const id = setInterval(() => {
                message.channel.send(outa[i]);
                i++
                if (i >= outa.length){
                    clearInterval(id);
                }
            }, 500);

        }
        return "success";
    }
};

export = new VoiceLog();