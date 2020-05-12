"use strict";
class StopPoll {
    constructor() {
        this.name = 'stoppoll';
        this.description = 'Остановить голосование немедлянно!';
        this.cooldown = 0;
        this.usage = '[Номер голосования]';
        this.args = 1;
        this.permlevel = 0;
    }
    execute(message, args, authflag) {
        const client = message.client;
        const id = Number(args[0]);
        if (id > 0) {
            const removed = client.polls.splice(id - 1, 1);
            if (removed) {
                const collector = removed[0];
                const userid = collector.msg.author.id;
                if (message.author.id == userid || authflag) {
                    message.channel.send(`Голосование номер ${id} остановлено!`);
                    collector.stop('userstop');
                }
                else {
                    message.channel.send(`Это голосование было создано не вами!`);
                }
            }
            return "success";
        }
        return "error";
    }
}
;
module.exports = new StopPoll();
