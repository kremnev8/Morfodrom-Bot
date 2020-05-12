"use strict";
const Discord = require("discord.js");
class SendEmbed {
    constructor() {
        this.name = 'sendembed';
        this.description = 'Данная команда позволяет отправить Embed сообщение от имени бота.';
        this.args = 0;
        this.guildOnly = true;
        this.usage = '[Сообщение]';
        this.permlevel = 0;
    }
    execute(message, args, authflag, commandName) {
        const input = message.content.slice(commandName.length + 2);
        const helpmsg = new Discord.MessageEmbed().setColor('#eeee00').setTitle(' ');
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
        helpmsg.setAuthor(message.member.displayName, message.author.avatarURL());
        message.channel.send(helpmsg);
        return "success";
    }
}
;
module.exports = new SendEmbed();
