"use strict";
class Lang {
    constructor() {
        this.name = 'lang';
        this.description = 'Изменение языка. A оно вам надо?';
        this.cooldown = 2;
        this.args = 1;
        this.guildOnly = true;
        this.Authorize = true;
        this.permlevel = 2;
        this.usage = '[Имя языка]';
    }
    execute(message, args) {
        const client = message.client;
        const newlang = args[0].toLowerCase();
        if (client.langs.get(newlang)) {
            client.lang = newlang;
            message.channel.send(`Language was successfully changed to ${newlang}`);
        }
        return "success";
    }
}
;
module.exports = new Lang();
