"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Discord = require("discord.js");
const log4js = require("log4js");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const sprintf_js_1 = require("sprintf-js");
const util = require("./utilites");
const gapi = require("./googleapi");
const authorizaton = require("./authorization");
const types = require("./index");
class ClientImpl extends types.AClient {
    constructor(options) {
        super(options);
        this.modules = new Discord.Collection();
        this.langs = new Discord.Collection();
        this.sheets = gapi.getSheets(configPath);
        this.lang = "ru";
        this.connection_status = false;
        this.configPath = configPath;
    }
    checkAuthorizaton(user) {
        return authorizaton.checkAuthorizaton(this.guild, user);
    }
    curentLang() {
        return this.langs.get(this.lang);
    }
    ;
}
let configName = 'config';
if (process.env.NODE_ENV == "production")
    configName = 'production';
const configPath = path.join(__dirname, '..', configName);
const config = util.loadJson(`${configPath}/config`);
global.config = config;
console.log(config);
const modulesPath = path.join(__dirname, config.moduleFolder);
const logsPath = path.join(__dirname, config.logsFolder);
const langPath = path.join(__dirname, config.langFolder);
console.log(logsPath);
const cooldowns = new Discord.Collection();
log4js.configure({
    appenders: {
        file: {
            type: 'dateFile',
            filename: path.join(logsPath, 'Discord bot.log'),
            pattern: ".dd-MM-yy",
            keepFileExt: true,
            alwaysIncludePattern: true,
            daysToKeep: 7,
        },
        file2: {
            type: 'dateFile',
            filename: path.join(logsPath, 'Voice.log'),
            pattern: ".dd-MM-yy",
            keepFileExt: true,
            alwaysIncludePattern: true,
            daysToKeep: 7,
        },
        out: {
            type: 'stdout',
        },
    },
    categories: {
        default: {
            appenders: ['file', 'out'],
            level: 'debug',
        },
        discord4j: {
            appenders: ['file', 'out'],
            level: 'debug',
        },
        voice: {
            appenders: ['file2', 'out'],
            level: 'debug',
        },
    },
});
global.logger = log4js.getLogger("default");
const vlogger = log4js.getLogger("voice");
global.vlogger = vlogger;
global.logger.info(`Started Discord bot process`);
config.moduleFolder;
const moduleFiles = fs.readdirSync(modulesPath).filter(file => file.endsWith('.js'));
const exeFiles = fs.readdirSync(__dirname).filter(file => file.endsWith('.js'));
const langFiles = fs.readdirSync(langPath).filter(file => file.endsWith('.js'));
const client = new ClientImpl();
const prefix = config.prefix;
client.lastLetter = config.lastLetter;
client.sID = config.googleSheets;
const d4jl = log4js.getLogger("discord4j");
let hashes = util.loadJson(`${configPath}/filehashes`);
const win = require('os').platform() == "win32";
const ver = hashes[(win ? "version_exp" : "version_stable")];
let unsigned = false;
client.win = win;
global.logger.info(`Running ${win ? "experemental" : "stable"} code, version ${ver}`);
for (const file of moduleFiles) {
    const hash = util.hash(`${modulesPath}/${file}`);
    let valid = true;
    if (!hashes[file] || hashes[file] != hash) {
        global.logger.error(`Hash: ${hash} of ${file} does not match ${hashes[file]}!`);
        valid = false;
        unsigned = true;
    }
    else {
        global.logger.info(`Hash of ${file} does match ${hash}.`);
    }
    const module = require(`${modulesPath}/${file}`);
    client.modules.set(module.name, module);
}
for (const file of exeFiles) {
    let hash = util.hash(`${__dirname}/${file}`);
    if (!hashes[file] || hashes[file] != hash) {
        global.logger.error(`Hash: ${hash} of ${file} does not match ${hashes[file]}!`);
        unsigned = true;
    }
    else {
        global.logger.info(`Hash of ${file} does match ${hash}.`);
    }
}
for (const file of langFiles) {
    const lang = require(`${langPath}/${file}`);
    client.langs.set(lang.name, lang);
}
client.on('shardReconnecting', () => {
    if (client.connection_status == true) {
        global.logger.debug(`Lost connection to discord!`);
        client.connection_status = false;
    }
});
client.on('ready', () => {
    global.logger.info(`Logged in as ${client.user.tag}!`);
    client.connection_status = true;
    client.user.setActivity(`${!unsigned ? (win ? "бета" : "гамма") : (win ? "альфа" : "бета")} версию №${ver}`);
    client.guild = client.guilds.cache.get("368841883654553621");
    initModules();
});
function initModules() {
    client.modules.each(module => {
        try {
            if (module.init) {
                module.init(client);
            }
            if (util.isInterval(module) && !module.manual) {
                let interval = module.interval || module.getInterval(client);
                if (interval) {
                    let func = module.execute;
                    setInterval(() => {
                        func(client);
                    }, interval);
                }
            }
        }
        catch (error) {
            global.logger.error(error);
        }
    });
}
client.on('shardResume', () => {
    global.logger.debug(`Resumed connection! Logged in as ${client.user.tag}!`);
    client.connection_status = true;
    client.user.setActivity(`${!unsigned ? (win ? "бета" : "гамма") : (win ? "альфа" : "бета")} версию №${ver}`);
});
client.on('message', message => {
    if (!message.content.startsWith(prefix) || message.author.bot)
        return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();
    const module = client.modules.get(commandName) ||
        client.modules.find(cmd => {
            if (util.isCommand(cmd))
                return cmd.aliases && cmd.aliases.includes(commandName);
        });
    if (!module) {
        message.reply(client.curentLang().cmd_notfound);
        return;
    }
    if (util.isCommand(module)) {
        if (module.args && args.length < module.args) {
            let reply = sprintf_js_1.sprintf(client.curentLang().missing_arguments, message.author);
            if (module.usage) {
                reply += sprintf_js_1.sprintf(client.curentLang().usage, prefix, commandName, module.usage);
            }
            return message.channel.send(reply);
        }
        if ((module.guildOnly || (module.Authorize && !module.Allow_DM)) && message.channel.type !== 'text') {
            return message.reply(client.curentLang().notdm);
        }
        const authlevel = client.checkAuthorizaton(message.author);
        const authflag = authlevel > 0;
        if (module.Authorize) {
            if (authlevel < module.permlevel) {
                return;
            }
            if (!authflag) {
                return message.reply(client.curentLang().lackperm);
            }
        }
        if (!cooldowns.has(module.name)) {
            cooldowns.set(module.name, new Discord.Collection());
        }
        const now = Date.now();
        const timestamps = cooldowns.get(module.name);
        const cooldownAmount = (module.cooldown || 3) * 1000;
        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(sprintf_js_1.sprintf(client.curentLang().timeout, timeLeft, module.name));
            }
        }
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        if (util.isAsync(module.execute)) {
            module.execute(message, args, authflag, commandName).then(status => {
                if (status == "success") {
                    global.logger.debug(`Command ${commandName} has been executed successfully!`);
                }
                else {
                    global.logger.debug(`There was an error while executing command ${commandName}!`);
                }
            }).catch(error => {
                global.logger.debug(`There was an error while executing command ${commandName}!`);
                global.logger.error(error);
                message.reply(client.curentLang().error);
            });
        }
        else {
            try {
                let status = module.execute(message, args, authflag, commandName);
                if (status == "success") {
                    global.logger.debug(`Command ${commandName} has been executed successfully!`);
                }
                else {
                    global.logger.debug(`There was an error while executing command ${commandName}!`);
                }
            }
            catch (error) {
                global.logger.debug(`There was an error while executing command ${commandName}!`);
                global.logger.error(error);
                message.reply(client.curentLang().error);
            }
        }
    }
    else {
        message.reply(client.curentLang().cmd_notfound);
    }
});
client.callModuleFunction = function (moduleName, functionName, ...args) {
    const module = client.modules.get(moduleName);
    if (module) {
        const func = module[functionName];
        if (func) {
            func(...args);
        }
    }
};
client.login(process.env.TOKEN);
client.on('warn', info => {
    d4jl.warn(info);
});
client.on('error', error => {
    d4jl.error(error.message);
});
client.on('debug', info => {
    d4jl.debug(info);
});
process.on('SIGINT', () => {
    global.logger.info('User pressed CTRL + C, Terminating.');
    client.callModuleFunction("voicelogger", "saveCurrentVoiceChannelData", client);
    log4js.shutdown();
    process.exit();
});
process.on('SIGTERM', () => {
    global.logger.info('User pressed CTRL + C, Terminating.');
    client.callModuleFunction("voicelogger", "saveCurrentVoiceChannelData", client);
    log4js.shutdown();
    process.exit();
});
process
    .on('unhandledRejection', (reason, p) => {
    global.logger.error(reason, 'Unhandled Rejection at Promise', p);
})
    .on('uncaughtException', err => {
    global.logger.error(err, 'Uncaught Exception thrown');
    client.callModuleFunction("voicelogger", "saveCurrentVoiceChannelData", client);
    process.exit(1);
});
var hook_stream = function (_stream, fn) {
    var old_write = _stream.write;
    _stream.write = fn;
    return function () {
        _stream.write = old_write;
    };
};
hook_stream(process.stderr, function (string, encoding, fd) {
    global.logger.error(string);
});
