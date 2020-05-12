"use strict";
const fs = require("fs");
const crypto = require("crypto");
const util_1 = require("util");
const dateParserRu = /(\d{1,2})\.(\d{1,2})\.(\d{2}) (\d{1,2}):(\d{1,2})/;
const dateParserEn = /(\d{1,2})\/(\d{1,2})\/(\d{2}) (\d{1,2}):(\d{1,2})/;
module.exports = {
    isCommand(arg) {
        return arg.permlevel !== undefined;
    },
    isInterval(arg) {
        return arg.manual !== undefined;
    },
    isAsync: util_1.types.isAsyncFunction,
    loadJson(filename) {
        const early = global.logger == undefined;
        var data = {};
        try {
            let fd = fs.openSync(`${filename}.json`, 'r');
            if (!fd) {
                if (!early) {
                    global.logger.error(`${filename}.json does not exist!`);
                }
                else
                    console.error(`${filename}.json does not exist!`);
            }
            else {
                let file = fs.readFileSync(fd, "utf-8");
                fs.closeSync(fd);
                data = JSON.parse(file);
            }
        }
        catch (error) {
            if (!early) {
                global.logger.warn(error);
            }
            else
                console.warn(error);
        }
        return data;
    },
    saveJson(filename, data) {
        let fd = fs.openSync(`${filename}.json`, 'w');
        if (!fd) {
            global.logger.error(`Unexpected error while saving ${filename}.json`);
        }
        else {
            fs.writeFileSync(fd, JSON.stringify(data, undefined, ' '));
            fs.closeSync(fd);
        }
    },
    pluralizeRu(count, words) {
        var cases = [2, 0, 1, 1, 1, 2];
        return `${count} ${words[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]]}`;
    },
    hash(filename) {
        const hash = crypto.createHash('md5');
        hash.setEncoding('hex');
        let fd = fs.openSync(filename, 'r');
        if (!fd) {
            global.logger.error(`${filename} does not exist!`);
        }
        else {
            let file = fs.readFileSync(fd, "utf-8");
            fs.closeSync(fd);
            hash.write(file);
            hash.end();
        }
        return hash.read();
    },
    RuDateParse(string) {
        var match = string.match(dateParserRu);
        if (match) {
            return new Date(20 + match[3], match[2] - 1, match[1], match[4], match[5]);
        }
        else {
            throw Error("Invalid Date");
        }
    },
    EnDateParse(string) {
        var match = string.match(dateParserEn);
        if (match && match[1] <= 12) {
            return new Date(20 + match[3], match[1] - 1, match[2], match[4], match[5]);
        }
        else {
            throw Error("Invalid Date");
        }
    }
};
