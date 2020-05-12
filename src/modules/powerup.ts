import Discord = require('discord.js');
import * as types from '../index';
import wol = require('wake_on_lan');

class PowerUp implements types.ICommandModule {
    name = 'powerup';
    description = 'Включить мой пк...';
    Authorize = true;
    Allow_DM = true;
    permlevel = 2;
    args = 0;

    execute(message: Discord.Message, args: string[]): types.ResultLike {
        const client: types.AClient = message.client as types.AClient;

        if (client.win) {
            message.channel.send('Сам себя компьютер включить не может!');
            return "error";
        }
        wol.wake('94:DE:80:7A:5F:41', function(error) {
            if (error) {
                message.channel.send('Что то пошло не так...');
            }
            else {
                message.channel.send('Компьютер будет запущен вот вот!');
            }
        });
        return "success";
    }
};

export = new PowerUp();