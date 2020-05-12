"use strict";
const fs = require("fs");
const sprintf_js_1 = require("sprintf-js");
class Submit {
    constructor() {
        this.name = 'submit';
        this.description = 'Вы знаете интересные шутки? Если да, то вы можете их мне отправить, что бы я мог стать еше лучше!';
        this.cooldown = 10;
        this.args = 1;
        this.usage = '[Ваша шутка]';
        this.permlevel = 0;
    }
    execute(message, args) {
        const client = message.client;
        const ret = message.content.match(/\S+\s(.+)/);
        const joke = ret[1];
        const fjoke = sprintf_js_1.sprintf(client.curentLang().joke_text, joke, message.author.username);
        fs.appendFile(`${client.configPath}/jokes.txt`, fjoke, (err) => {
            if (err)
                throw err;
            global.logger.info(`new joke was submited by ${message.author.username}`);
        });
        message.channel.send(sprintf_js_1.sprintf(client.curentLang().submsucs));
        return "success";
    }
}
;
module.exports = new Submit();
