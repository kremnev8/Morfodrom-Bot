import { sprintf } from 'sprintf-js';
import Discord = require('discord.js');
import * as types from '../index';

class StopPoll implements types.ICommandModule {
    name = 'stoppoll';
    description = 'Остановить голосование немедлянно!';
    cooldown = 0;
    usage = '[Номер голосования]';
    args = 1;
    permlevel = 0;

    execute(message: Discord.Message, args: string[], authflag: boolean): types.ResultLike {
        const client: types.AClient = message.client as types.AClient;
        const id = Number(args[0]);
        if (id > 0) {

            const removed = client.polls.splice(id - 1, 1);
            if (removed) {
                const collector = removed[0];
                const userid = collector.msg.author.id;
                if (message.author.id == userid || authflag) {
                    message.channel.send(`Голосование номер ${id} остановлено!`);
                    collector.stop('userstop');
                }
                else {
                    message.channel.send(`Это голосование было создано не вами!`);
                }
            }

            return "success";
        }
        return "error";
    }
};

export = new StopPoll();