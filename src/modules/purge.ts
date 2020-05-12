import util = require('../utilites.js');
import { sprintf } from 'sprintf-js';
import Discord = require('discord.js');
import * as types from '../index';


class Purge implements types.ICommandModule {
    name = 'purge';
    description = 'Удалить пользователя из системы';
    args = 1;
    guildOnly = true;
    Authorize = true;
    permlevel = 1;
    usage = '[Внутреигровой ник]';

    async execute(message: Discord.Message, args: string[]): Promise < string > {
        const client: types.AClient = message.client as types.AClient;

        const nickname: string = args[0];
        if (nickname) {

            let result = await client.sheets.spreadsheets.values.get({
                spreadsheetId: client.sID,
                range: "Участники!B2:B102",
            });

            const test = function(element: string, index: number, array: string[]) {
                return element[0] == this;
            };
            const table: string[] = result.data.values as any;
            const ind = table.findIndex(test, nickname);

            if (ind != -1) {

                const userData = await client.sheets.spreadsheets.values.get({
                    spreadsheetId: client.sID,
                    range: `Участники!B${ind + 2}:${client.lastLetter}${ind + 2}`,
                });

                const userID: string = userData.data.values[6] as any;
                const member = client.guild.members.cache.get(userID);
                if (member) {
                    if (member.roles.cache.has("394957292581158923")) {
                        global.logger.info(`${member.displayName} no longer is in clan!`)
                        member.roles.remove('394957292581158923', 'Участник более не состоит в клане Warframe');
                        member.roles.add("586270815218171918");
                    }
                }


                const dataBuffer = await client.sheets.spreadsheets.values.get({
                    spreadsheetId: client.sID,
                    range: `Участники!B${ind + 3}:${client.lastLetter}103`,
                });

                let data = dataBuffer.data.values;
                if (!data) data = [];
                data[data.length] = ["", "", "", "", "", "", "", "", "", ""];

                await client.sheets.spreadsheets.values.update({
                    spreadsheetId: client.sID,
                    range: `Участники!B${ind + 2}:${client.lastLetter}102`,
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: data,
                    },
                });

                message.channel.send(sprintf(client.curentLang().purge, nickname));
                return "success"

            }
            else {
                message.channel.send(sprintf(client.curentLang().infonotfound, nickname));
                return "error";
            }
        }
    }
};

export = new Purge();