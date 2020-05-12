import util = require('../utilites.js');
import { sprintf } from 'sprintf-js';
import Discord = require('discord.js');
import * as types from '../index';

class ListUsers implements types.ICommandModule {
    name = 'listusers';
    description = 'Список всех пользователей находящихся в базе данных';
    guildOnly = true;
    Authorize = true;
    permlevel = 1;

    async execute(message: Discord.Message, args: string[]): Promise < string > {
        const client: types.AClient = message.client as types.AClient;

        let users: string = "";

        let result = await client.sheets.spreadsheets.values.get({
            spreadsheetId: client.sID,
            range: "Участники!B2:B102",
        });
        let table: string[] = result.data.values as any;
        for (let i = 0; i < table.length; i++) {
            users = `${users}${users == "" ? "" : ","} ${table[i][0]}`;
        }
        if (users != "") {
            message.channel.send(sprintf(client.curentLang().alltheusers, users));
            return "success";
        }
    }
};

export = new ListUsers();