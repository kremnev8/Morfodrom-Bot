import util = require('../utilites.js');
import { sprintf } from 'sprintf-js';
import Discord = require('discord.js');
import * as types from '../index';

class LogUsers implements types.ICommandModule {
    name = 'loguser';
    description = 'Система отслеживания игроков клана Morfodrom\nУчтите что ники с пробелами не поддерживаются!';
    args = 4;
    guildOnly = true;
    Authorize = true;
    permlevel = 1;
    usage = '[Внутреигровой ник] [Дата вступления] [Пригласивший] (ID в дискорде или @игрок в дискорде)';

    async execute(message: Discord.Message, args: string[]): Promise < string > {
        const client: types.AClient = message.client as types.AClient;

        const nickname: string = args[0];
        const datein: string = `${args[1]} ${args[2]}`;
        const invitedby: string = args[3];

        let userid: string = args[4];
        let member: Discord.GuildMember;
        let gotid: boolean = true;

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
            message.reply(sprintf(client.curentLang().invinput));
            return "error";
        }
        try {
            const dateinparse = util.EnDateParse(datein);
            const dcur = new Date();

            if (dcur.getTime() - dateinparse.getTime() < 0) {
                message.reply(sprintf(client.curentLang().futuredate, datein));
                return "error";
            }

            if (nickname && dateinparse) {

                const dateloc: string = sprintf('%02s.%02s.%02s %02s:%02s', dateinparse.getDate(), dateinparse.getMonth() + 1, dateinparse.getFullYear(), dateinparse.getHours(), dateinparse.getMinutes());
                let id: string = "";
                let username: string = "-";
                if (gotid) {
                    id = userid;
                    if (member) {
                        username = member.displayName
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
                message.channel.send(sprintf(client.curentLang().logsucs, nickname));
                return "success";

            }

        }
        catch (error) {
            message.reply(sprintf(client.curentLang().invdate, datein));
            return "error";
        }

    }
};

export = new LogUsers();