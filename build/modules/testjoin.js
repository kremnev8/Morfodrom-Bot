"use strict";
class TestJoin {
    constructor() {
        this.name = 'test';
        this.description = 'Просто проверка. Ничего больше, поверьте.';
        this.args = 0;
        this.Authorize = true;
        this.Allow_DM = true;
        this.permlevel = 2;
        this.usage = '';
    }
    execute(message, args) {
        global.logger.info(message.author.presence);
        return "success";
    }
}
;
module.exports = new TestJoin();
