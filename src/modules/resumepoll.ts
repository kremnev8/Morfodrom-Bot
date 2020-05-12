import util = require('../utilites');
import * as types from '../index';
import Discord = require('discord.js');

class ResumePoll implements types.ICommandModule {
    name = 'resumepoll';
    description = 'Недокументировано';
    cooldown = 0;
    usage = '[Время] [ID сообщения]';
    args = 2;
    permlevel = 0;

    async execute(message: Discord.Message, args: string[], authflag: boolean): Promise < string > {
        const client: types.AClient = message.client as types.AClient;

        const timeout: number = Number(args[0]);
        const mid: string = args[1];

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

        // let msg = await message.channel.send(`Открыто голосование! Времени до истечения: ${timeout} минуты. Варианты: `);
        await message.channel.send(`Номер голосования: ${client.polls.length+1}`);

        const emojies: string[] = args;
        const reactions: Discord.MessageReaction[] = [];
        msg.reactions.cache.each((react: Discord.MessageReaction) => {
            react.users.fetch().then(users => {
                reactions.push(react);
            });
            emojies.push(react.emoji.name);
        })

        // Filters
        const filter = (reaction: Discord.MessageReaction, user: Discord.User) => {
            if (user.bot) return false;
            return emojies.includes(reaction.emoji.name);
        }

        const filterInvalid = (reaction: Discord.MessageReaction, user: Discord.User) => {
            for (let i = 0; i < reactions.length; i++) {
                const react = reactions[i];
                if (react != undefined && react.emoji.name != reaction.emoji.name) {
                    if (react.users.cache.get(user.id) != undefined) {
                        return true;
                    }
                }
            }
            return !emojies.includes(reaction.emoji.name);
        }
        // const filterDown = (reaction, user) => reaction.emoji.name === '👎' && user.id === message.author.id;

        const collector = msg.createReactionCollector(filter);

        const invalid = msg.createReactionCollector(filterInvalid);

        client.polls.push(collector);
        // const down = msg.createReactionCollector(filterDown, {timer: 6000});

        invalid.on('collect', (reaction: Discord.MessageReaction, user: Discord.User) => {
            if (!user.bot) reaction.users.remove(user);
        })

        collector.on('collect', (reaction: Discord.MessageReaction) => {
            const name = reaction.emoji.name;
            for (let i = 0; i < emojies.length; i++) {
                if (name == emojies[i]) {
                    reactions[i] = reaction;
                }
            }
        })

        collector.on('end', (reaction: Discord.MessageReaction, reason: string) => {
            invalid.stop('');
            if (reason == 'timeout') message.channel.send('Голосование закончено!');
            message.channel.send('Результаты');
            for (let i = 0; i < emojies.length; i++) {
                message.channel.send(`${emojies[i]} - ${reactions[i] != undefined ? reactions[i].count-1 : 0} голосов.`);
            }
        })

        setTimeout(() => {
            collector.stop('timeout');
        }, 60000 * timeout)


        return "success";
    }
};

export = new ResumePoll();