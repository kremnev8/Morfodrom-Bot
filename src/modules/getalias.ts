import util = require('../utilites.js');
import { sprintf } from 'sprintf-js';
import Discord = require('discord.js');
import * as types from '../index';

var data;

class GetAlias implements types.ICommandModule {
    name = 'getalias';
    description = 'Информация о никах других игроков в дискорде.\nУчтите что ники с пробелами не поддерживаются!';
    args = 1;
    guildOnly = true;
    usage = '[Имя игрока в Warframe]';
    aliases = ['whoareyou'];
    permlevel = 0;
    async execute(message: Discord.Message, args: string[]): Promise < string > {
        const client: types.AClient = message.client as types.AClient;

        const nickname: string = args[0];
        if (nickname) {

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

                const result1 = await client.sheets.spreadsheets.values.get({
                    spreadsheetId: client.sID,
                    range: `Участники!H${ind + 2}`,
                });

                const id: string = result1.data.values[0][0];
                message.channel.send(sprintf(client.curentLang().userfound, id));
                return "success";

            }
            else {
                message.channel.send(sprintf(client.curentLang().infonotfound, nickname));
                return "error";
            }
        }
    }
};

export = new GetAlias();