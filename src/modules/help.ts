import { sprintf } from 'sprintf-js';
import Discord = require('discord.js');
import * as types from '../index';
import util = require('../utilites');

class Help implements types.ICommandModule {
    name = 'help';
    description = 'Данная команда предоставляет информацию о командах доступных вам';
    args = 0;
    aliases = ['commands'];
    usage = '[Имя команды]';
    permlevel = 0;

    execute(message: Discord.Message, args: string[]): types.ResultLike {
        const client: types.AClient = message.client as types.AClient;

        const level = client.checkAuthorizaton(message.author);

        const data: string[] = [];
        const temp: string[] = [];

        if (!args.length) {
            data.push(client.curentLang().help1);
            client.modules.each(module => {
                if (util.isCommand(module) && level >= module.permlevel) {
                    temp.push(module.name);
                }
            });
            data.push(temp.join(', '));

            data.push(sprintf(client.curentLang().help2, global.config.prefix));

            message.author.send(data, {
                split: true
            }).then(() => {
                if (message.channel.type === 'dm') return;
                message.reply(client.curentLang().helpdm);
            }).catch(error => {
                global.logger.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                message.reply(client.curentLang().helpnodm);
            });
            return "success";
        }

        const name: string = args[0].toLowerCase();
        const module = client.modules.get(name) ||
            client.modules.find(cmd => {
                if (util.isCommand(cmd))
                    return cmd.aliases && cmd.aliases.includes(name);
            });

        if (util.isCommand(module)) {

            if (level < module.permlevel) {
                message.reply(client.curentLang().cmd_notfound);
                return "error";
            }

            const helpmsg = new Discord.MessageEmbed()
                .setColor('#ee0000')
                .setTitle(`${module.name}`);
            if (module.description) {
                helpmsg.setDescription(`${module.description}`);
            }
            if (module.usage) {
                helpmsg.addField(client.curentLang().helpemb1, `${global.config.prefix}${module.name} ${module.usage}`).addField('\u200b', '\u200b');
            }
            if (module.aliases) helpmsg.addField(client.curentLang().helpemb2, `${module.aliases.join(', ')}`, true);

            helpmsg.setFooter(sprintf(client.curentLang().helpembcd, module.cooldown || 0)).setTimestamp();

            message.channel.send(helpmsg);
            return "success";
        }
        else {
            message.reply(client.curentLang().cmd_notfound);
            return "error";
        }
    }
};

export = new Help();