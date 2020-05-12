"use strict";
const wol = require("wake_on_lan");
class PowerUp {
    constructor() {
        this.name = 'powerup';
        this.description = 'Включить мой пк...';
        this.Authorize = true;
        this.Allow_DM = true;
        this.permlevel = 2;
        this.args = 0;
    }
    execute(message, args) {
        const client = message.client;
        if (client.win) {
            message.channel.send('Сам себя компьютер включить не может!');
            return "error";
        }
        wol.wake('94:DE:80:7A:5F:41', function (error) {
            if (error) {
                message.channel.send('Что то пошло не так...');
            }
            else {
                message.channel.send('Компьютер будет запущен вот вот!');
            }
        });
        return "success";
    }
}
;
module.exports = new PowerUp();
