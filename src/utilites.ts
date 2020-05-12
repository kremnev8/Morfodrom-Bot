import * as fs from 'fs';
import * as crypto from 'crypto';
import { types } from 'util';
import * as mytypes from './index';

const dateParserRu = /(\d{1,2})\.(\d{1,2})\.(\d{2}) (\d{1,2}):(\d{1,2})/;
const dateParserEn = /(\d{1,2})\/(\d{1,2})\/(\d{2}) (\d{1,2}):(\d{1,2})/;

export = {

    /**
     * User Defined Type Guard!
     */
    isCommand(arg: mytypes.IBotModule): arg is mytypes.ICommandModule
    {
        return (arg as mytypes.ICommandModule).permlevel !== undefined;
    },

    /**
     * User Defined Type Guard!
     */
    isInterval(arg: mytypes.IBotModule): arg is mytypes.IIntervalModule
    {
        return (arg as mytypes.IIntervalModule).manual !== undefined;
    },

    isAsync: types.isAsyncFunction,

    loadJson(filename: string): mytypes.Object<any>
    {
        const early = global.logger == undefined;

        var data = {};
        try
        {
            let fd = fs.openSync(`${filename}.json`, 'r');

            if (!fd)
            {
                if (!early) {
                    global.logger.error(`${filename}.json does not exist!`);
                } else console.error(`${filename}.json does not exist!`);
            }
            else
            {
                let file = fs.readFileSync(fd, "utf-8");
                fs.closeSync(fd);
                data = JSON.parse(file);
            }
        }
        catch (error)
        {
            if (!early) {
                global.logger.warn(error);
            } else console.warn(error);
        }
        return data;
    },

    saveJson(filename: string, data: mytypes.Object<any>)
    {

        let fd = fs.openSync(`${filename}.json`, 'w');

        if (!fd)
        {
            global.logger.error(`Unexpected error while saving ${filename}.json`);
        }
        else
        {
            fs.writeFileSync(fd, JSON.stringify(data, undefined, ' '));
            fs.closeSync(fd);
        }
    },

    pluralizeRu(count: number, words: string[]): string
    {
        var cases = [2, 0, 1, 1, 1, 2];
        return `${count} ${words[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]]}`;
    },

    hash(filename: string): string
    {

        const hash = crypto.createHash('md5');
        hash.setEncoding('hex');

        let fd = fs.openSync(filename, 'r');

        if (!fd)
        {
            global.logger.error(`${filename} does not exist!`);
        }
        else
        {
            let file = fs.readFileSync(fd, "utf-8");
            fs.closeSync(fd);
            hash.write(file);
            hash.end();
        }
        return hash.read();
    },

    RuDateParse(string): Date
    {
        var match = string.match(dateParserRu);
        if (match)
        {
            return new Date(
                20 + match[3],
                match[2] - 1,
                match[1],
                match[4],
                match[5]
            );
        }
        else
        {
            throw Error("Invalid Date");
        }
    },

    EnDateParse(string): Date
    {
        var match = string.match(dateParserEn);

        if (match && match[1] <= 12)
        {


            return new Date(
                20 + match[3], // year
                match[1] - 1, // month
                match[2], // day
                match[4],
                match[5]
            );

        }
        else
        {
            throw Error("Invalid Date");
        }
    }
};