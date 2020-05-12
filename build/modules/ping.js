"use strict";
class Ping {
    constructor() {
        this.name = 'ping';
        this.description = 'Проверка связи. А еще пинг понг.';
        this.cooldown = 2;
        this.aliases = ['пинг'];
        this.permlevel = 0;
    }
    execute(message, args) {
        message.channel.send('Pong.');
        return "success";
    }
}
;
module.exports = new Ping();
