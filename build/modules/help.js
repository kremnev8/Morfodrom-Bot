"use strict";
const sprintf_js_1 = require("sprintf-js");
const Discord = require("discord.js");
const util = require("../utilites");
class Help {
    constructor() {
        this.name = 'help';
        this.description = 'Данная команда предоставляет информацию о командах доступных вам';
        this.args = 0;
        this.aliases = ['commands'];
        this.usage = '[Имя команды]';
        this.permlevel = 0;
    }
    execute(message, args) {
        const client = message.client;
        const level = client.checkAuthorizaton(message.author);
        const data = [];
        const temp = [];
        if (!args.length) {
            data.push(client.curentLang().help1);
            client.modules.each(module => {
                if (util.isCommand(module) && level >= module.permlevel) {
                    temp.push(module.name);
                }
            });
            data.push(temp.join(', '));
            data.push(sprintf_js_1.sprintf(client.curentLang().help2, global.config.prefix));
            message.author.send(data, {
                split: true
            }).then(() => {
                if (message.channel.type === 'dm')
                    return;
                message.reply(client.curentLang().helpdm);
            }).catch(error => {
                global.logger.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                message.reply(client.curentLang().helpnodm);
            });
            return "success";
        }
        const name = args[0].toLowerCase();
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
            if (module.aliases)
                helpmsg.addField(client.curentLang().helpemb2, `${module.aliases.join(', ')}`, true);
            helpmsg.setFooter(sprintf_js_1.sprintf(client.curentLang().helpembcd, module.cooldown || 0)).setTimestamp();
            message.channel.send(helpmsg);
            return "success";
        }
        else {
            message.reply(client.curentLang().cmd_notfound);
            return "error";
        }
    }
}
;
module.exports = new Help();
