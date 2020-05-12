"use strict";
const util = require("../utilites");
class DynamicPoll {
    constructor() {
        this.name = 'dynamicpoll';
        this.description = 'Недокументировано';
        this.cooldown = 0;
        this.aliases = ['poll', 'Опрос'];
        this.usage = '[Время] [ID сообщения]';
        this.args = 2;
        this.permlevel = 0;
    }
    init(client) {
        client.polls = [];
    }
    async execute(message, args) {
        global.logger.info(message.content);
        const client = message.client;
        const timeout = Number(args.shift());
        const msgid = args.shift();
        const msg = await message.channel.messages.fetch(msgid);
        if (msg) {
            await message.channel.send(`Открыто голосование! Времени до истечения: ${util.pluralizeRu(timeout, ["минута", "минуты", "минут"])}. Номер голосования: ${client.polls.length + 1}`);
            const emojies = args;
            const reactions = [];
            for (let i = 0; i < emojies.length; i++) {
                await msg.react(emojies[i]);
            }
            const filter = (reaction, user) => {
                if (user.bot)
                    return false;
                return emojies.includes(reaction.emoji.name);
            };
            const filterInvalid = (reaction, user) => {
                for (let i = 0; i < reactions.length; i++) {
                    const react = reactions[i];
                    if (react != undefined && react.emoji.name != reaction.emoji.name) {
                        if (react.users.cache.get(user.id) != undefined) {
                            return true;
                        }
                    }
                }
                return !emojies.includes(reaction.emoji.name);
            };
            const collector = msg.createReactionCollector(filter);
            const invalid = msg.createReactionCollector(filterInvalid);
            client.polls.push(collector);
            invalid.on('collect', (reaction, user) => {
                if (!user.bot)
                    reaction.users.remove(user);
            });
            collector.on('collect', (reaction) => {
                const name = reaction.emoji.name;
                for (let i = 0; i < emojies.length; i++) {
                    if (name == emojies[i]) {
                        reactions[i] = reaction;
                    }
                }
            });
            collector.on('end', (reaction, reason) => {
                invalid.stop('');
                if (reason == 'timeout')
                    message.channel.send('Голосование закончено!');
                message.channel.send('Результаты');
                for (let i = 0; i < emojies.length; i++) {
                    message.channel.send(`${emojies[i]} - ${reactions[i] != undefined ? reactions[i].count - 1 : 0} голосов.`);
                }
            });
            setTimeout(() => {
                collector.stop('timeout');
            }, 60000 * timeout);
            return "success";
        }
        else {
            message.channel.send(`Сообщение не найдено!`);
            return "error";
        }
    }
}
;
module.exports = new DynamicPoll();
