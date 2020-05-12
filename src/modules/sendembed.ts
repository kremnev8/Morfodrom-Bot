import util = require('../utilites');
import * as types from '../index';
import Discord = require('discord.js');


class SendEmbed implements types.ICommandModule {
    name = 'sendembed';
    description = 'Данная команда позволяет отправить Embed сообщение от имени бота.';
    args = 0;
    guildOnly = true;
    usage = '[Сообщение]';
    permlevel = 0;

    execute(message: Discord.Message, args: string[], authflag: boolean, commandName: string): types.ResultLike {

        const input = message.content.slice(commandName.length + 2);
        const helpmsg = new Discord.MessageEmbed().setColor('#eeee00').setTitle(' ');

        /*
        {
            "description": "this supports [named links](https://discordapp.com) on top of the previously shown subset of markdown. ```\nyes, even code blocks```",
            "image": {
                "url": "https://cdn.discordapp.com/embed/avatars/0.png"
            },
            "fields": [
                {
                    "name": "🤔",
                    "value": "this supports [named links](https://discordapp.com) on top of the previously shown subset of markdown"
                },
                {
                    "name": "😱",
                    "value": "try exceeding some of them!"
                }
            ]
        }*/

        if (input.startsWith("{")) {
            const parsedInput = JSON.parse(input);
            helpmsg.setDescription(parsedInput.description);
            helpmsg.setImage(parsedInput.image.url);
            const fl = parsedInput["fields"];

            fl.forEach(field => {
                helpmsg.addField(field.name, field.value, field.inline);
            });

        }
        else {
            helpmsg.setDescription(input);
        }

        helpmsg.setAuthor(message.member.displayName, message.author.avatarURL())

        message.channel.send(helpmsg);
        return "success";
    }
};

export = new SendEmbed();