import { sprintf } from 'sprintf-js';
import Discord = require('discord.js');
import * as types from '../index';


class TestJoin implements types.ICommandModule {
    name = 'test';
    description = 'Просто проверка. Ничего больше, поверьте.';
    args = 0;
    Authorize = true;
    Allow_DM = true;
    permlevel = 2;
    usage = '';

    execute(message: Discord.Message, args: string[]): types.ResultLike {
        global.logger.info(message.author.presence);
        return "success";
    }
};

export = new TestJoin();