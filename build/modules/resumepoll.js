"use strict";
class ResumePoll {
    constructor() {
        this.name = 'resumepoll';
        this.description = 'Недокументировано';
        this.cooldown = 0;
        this.usage = '[Время] [ID сообщения]';
        this.args = 2;
        this.permlevel = 0;
    }
    async execute(message, args, authflag) {
        const client = message.client;
        const timeout = Number(args[0]);
        const mid = args[1];
        for (let i = 0; i < client.polls.length; i++) {
            const msgid = client.polls[i].msg.id;
            if (msgid == mid) {
                message.channel.send(`Голосование с таким ID сообщения уже существует`);
                return "error";
            }
        }
        const msg = await message.channel.messages.fetch(mid);
        if (msg.author.id != message.author.id && !authflag) {
            message.channel.send(`Это голосование было создано не вами!`);
            return "error";
        }
        await message.channel.send(`Номер голосования: ${client.polls.length + 1}`);
        const emojies = args;
        const reactions = [];
        msg.reactions.cache.each((react) => {
            react.users.fetch().then(users => {
                reactions.push(react);
            });
            emojies.push(react.emoji.name);
        });
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
}
;
module.exports = new ResumePoll();
