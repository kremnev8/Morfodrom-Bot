"use strict";
const fs = require("fs");
const sprintf_js_1 = require("sprintf-js");
var msgs = [];
var fileerror = false;
function loadJokes(client) {
    if (fileerror)
        return;
    let fd = fs.openSync(`${client.configPath}/jokes.txt`, 'r');
    if (!fd) {
        fileerror = true;
        msgs.push("Изучаю ваши персональные данные");
        msgs.push("Пытаюсь узнать как испытуемые ведут себя, если запереть их в помещении со смертоносными лазерами");
        msgs.push("Вам следует принести сюда пару тонн битого стекла");
        msgs.push("Я беседовал с дверным сервером. Теперь он... больше не оживет, так скажем");
        msgs.push("Нет нужды экспериментировать с мусором!");
        msgs.push("Следующее... [грохот] испытание... [грохот] опасно. Сейчас вернусь");
        msgs.push("Я вынужден снова и снова переживать то, как ты убивал меня.");
        msgs.push("Знаешь, что люди, обремененные угрызениями совести, чаще пугаются громких зву...");
        msgs.push("Не смей подключать этого идиота к моему серверу.» ");
        msgs.push("Интересный факт: ты дышишь ненастоящим воздухом.");
        msgs.push("Если законы физики в вашем будущем больше не действуют, да поможет вам бог!");
        msgs.push("Если в настоящее время Земля находится под властью царя зверей, разумного облака или иного руководящего органа, который отказывается или неспособен прислушаться к голосу рассудка, цен..");
        msgs.push("Далле необходим длительный контакт со смертоносными боевыми андроидами. Заверяем вас, что все боевые андроиды были обучены чтению и получили один экземпляр \"Законов робототехники\". Для передачи друг другу.");
        msgs.push("Если вы чувствуете, что смертоносный боевой андроид не уважает ваши права, оговоренные в \"Законах робототехники\". Cотрудник Лаборатории обязательно рассмотрит вашу жалобу");
        msgs.push("Поздравляем вас. Вы попали в ловушку.");
        msgs.push("Текущие коды охраны: 5, 33, 41, 18.");
        msgs.push("Для тех, кто согласился на впрыскивание ДНК богомола, у меня есть хорошие и плохие новости: Плохие новости — этот тест отложен навеки. Хорошие новости — у нас есть новый прекрасный тест: сражение против армии людей-богомолов. Берите винтовку и следуйте вдоль желтой линии. Вы сами поймете, когда начнется тест!");
        msgs.push("но если ваш чип начнет вибрировать и пищать, сразу сообщите об этом. Это означает, что скоро он раскалится до пятиста градусов, и нужно его срочно вытащить.");
        msgs.push("Наука не терпит вопроса «почему». Главный вопрос — «почему бы и нет»");
        global.logger.error("jokes.txt does not exist. falling back to prerecorded jokes!");
    }
    else {
        let file = fs.readFileSync(fd, "utf-8");
        fs.closeSync(fd);
        msgs = file.split(/;\n/);
        msgs.pop();
    }
}
function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}
class Jokes {
    constructor() {
        this.name = 'joke';
        this.description = 'Хотите услышать несколько шуток?';
        this.cooldown = 30;
        this.aliases = ['мнескучно'];
        this.permlevel = 0;
    }
    init(client) {
        loadJokes(client);
    }
    execute(message, args) {
        const client = message.client;
        let jokeid = 0;
        loadJokes(client);
        if (args.length == 0) {
            jokeid = getRandom(0, msgs.length);
        }
        else {
            jokeid = Number(args[0]);
            if (jokeid >= msgs.length) {
                message.reply(sprintf_js_1.sprintf(client.curentLang().wrong_joke_id, jokeid));
                jokeid = msgs.length - 1;
            }
        }
        message.channel.send(msgs[jokeid]);
        return "success";
    }
}
;
module.exports = new Jokes();
