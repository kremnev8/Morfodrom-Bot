import Discord = require('discord.js');
import * as types from '../index';

class Ping implements types.ICommandModule {
    name = 'ping';
    description = 'Проверка связи. А еще пинг понг.';
    cooldown = 2;
    aliases = ['пинг'];
    permlevel = 0;

    execute(message: Discord.Message, args: string[]): types.ResultLike {
        message.channel.send('Pong.');
        return "success";
    }
};

export = new Ping();