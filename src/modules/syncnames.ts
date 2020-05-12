import { sprintf } from 'sprintf-js';
import Discord = require('discord.js');
import * as types from '../index';

class SyncNames implements types.ICommandModule {
    name = 'syncnames';
    description = 'Симхронизировать ники в дискорде и в таблице';
    args = 0;
    guildOnly = true;
    Authorize = true;
    permlevel = 1;

    async execute(message: Discord.Message, args: string[]): Promise < string > {
        const client: types.AClient = message.client as types.AClient;

        const result = await client.sheets.spreadsheets.values.get({
            spreadsheetId: client.sID,
            range: "Участники!H2:H102",
            majorDimension: "COLUMNS",
        });

        const table: string[] = result.data.values[0];
        const rettable: string[] = [];
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

        message.channel.send(sprintf(client.curentLang().syncsuccess));
        return "success"

    }
};

export = new SyncNames();