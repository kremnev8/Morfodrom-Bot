import { sprintf } from 'sprintf-js';
import Discord = require('discord.js');
import * as types from '../index';

class SetAlias implements types.ICommandModule {
    name = 'setalias';
    description = 'Команда записывает id игрока в дискорде в базу данных.\nУчтите что ники с пробелами не поддерживаются!';
    args = 1;
    guildOnly = true;
    Authorize = true;
    permlevel = 1;
    aliases = ['setdiscordid'];
    usage = '[Ник игрока в Warframe] [ID в дискорде или @игрок в дискорде]';


    async execute(message: Discord.Message, args: string[]): Promise < string > {
        const client: types.AClient = message.client as types.AClient;
        const nickname = args[0];
        let userid = args[1];
        let member;
        if (!userid || userid.includes("@")) {
            member = message.mentions.members.first();
            if (member) {
                userid = member.id;
            }
            else {
                message.channel.send(sprintf(client.curentLang().noping));
                return "error";
            }
        }

        if (nickname && userid) {

            const result = await client.sheets.spreadsheets.values.get({
                spreadsheetId: client.sID,
                range: "Участники!B2:B102",
            });

            const test = function(element: string, index: number, array: string[]) {
                return element[0] == this;
            };
            const table: string[] = result.data.values as any;
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

                message.channel.send(sprintf(client.curentLang().setaliassuccess, nickname));
                return "success";

            }
            else {
                message.channel.send(sprintf(client.curentLang().infonotfound, nickname));
                return "error";
            }


        }
    }
};

export = new SetAlias();