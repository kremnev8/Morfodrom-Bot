import Discord = require('discord.js');
import * as types from '../index';

class Lang implements types.ICommandModule {
    name = 'lang';
    description = 'Изменение языка. A оно вам надо?';
    cooldown = 2;
    args = 1;
    guildOnly = true;
    Authorize = true;
    permlevel = 2;
    usage = '[Имя языка]';

    execute(message: Discord.Message, args: string[]): types.ResultLike {
        const client: types.AClient = message.client as types.AClient;

        const newlang: string = args[0].toLowerCase();
        if (client.langs.get(newlang)) {
            client.lang = newlang;
            message.channel.send(`Language was successfully changed to ${newlang}`);
        }
        return "success";
    }
};

export = new Lang();