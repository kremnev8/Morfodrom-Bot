import util = require('../utilites');
import * as types from '../index';
import Discord = require('discord.js');

class DynamicPoll implements types.ICommandModule {
    name = 'dynamicpoll';
    description = 'Недокументировано';
    cooldown = 0;
    aliases = ['poll', 'Опрос'];
    usage = '[Время] [ID сообщения]';
    args = 2;
    permlevel = 0;

    init(client) {
        client.polls = [];
    }

    async execute(message: Discord.Message, args: string[]): Promise < string > {
        global.logger.info(message.content);
        const client: types.AClient = message.client as types.AClient;

        const timeout: number = Number(args.shift());
        const msgid: string = args.shift();

        const msg: Discord.Message = await message.channel.messages.fetch(msgid);

        if (msg) {
            // let msg = await message.channel.send(`Открыто голосование! Времени до истечения: ${timeout} минуты. Варианты: `);
            await message.channel.send(`Открыто голосование! Времени до истечения: ${util.pluralizeRu(timeout, ["минута", "минуты", "минут"])}. Номер голосования: ${client.polls.length+1}`);

            const emojies: string[] = args;
            const reactions: Discord.MessageReaction[] = [];
            for (let i = 0; i < emojies.length; i++) {
                await msg.react(emojies[i]);
            }
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
        else {
            message.channel.send(`Сообщение не найдено!`);
            return "error";
        }
    }
};
export = new DynamicPoll();