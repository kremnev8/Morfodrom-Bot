import fs = require('fs');
import { sprintf } from 'sprintf-js';
import Discord = require('discord.js');
import * as types from '../index';

class Submit implements types.ICommandModule {
    name = 'submit';
    description = 'Вы знаете интересные шутки? Если да, то вы можете их мне отправить, что бы я мог стать еше лучше!';
    cooldown = 10;
    args = 1;
    usage = '[Ваша шутка]';
    permlevel = 0;


    execute(message: Discord.Message, args: string[]): types.ResultLike {
        const client: types.AClient = message.client as types.AClient;
        const ret = message.content.match(/\S+\s(.+)/);
        const joke = ret[1];
        const fjoke = sprintf(client.curentLang().joke_text, joke, message.author.username);
        fs.appendFile(`${client.configPath}/jokes.txt`, fjoke, (err) => {
            if (err) throw err;
            global.logger.info(`new joke was submited by ${message.author.username}`);
        });
        message.channel.send(sprintf(client.curentLang().submsucs));
        return "success";
    }
};

export = new Submit();