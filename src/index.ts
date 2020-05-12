import Discord = require('discord.js');
import { sheets_v4 } from 'googleapis';
import log4js = require('log4js');

export type ResultLike = string | Promise < string > ;

export interface IBotModule {
    name: string;
    init ? (client: AClient) : void;
}

export interface ICommandModule extends IBotModule {
    execute(message: Discord.Message, args: string[], authflag ? : boolean, commandName ? : string): ResultLike;
    permlevel: number;
    description ? : string;
    args ? : number;
    aliases ? : string[]
    usage ? : string;
    cooldown ? : number;
    guildOnly ? : boolean;
    Authorize ? : boolean;
    Allow_DM ? : boolean;
}

export interface IIntervalModule extends IBotModule {
    manual: boolean;
    interval ? : number;
    getInterval ? (client: AClient) : number;
    execute(client: AClient): void;
}

export interface Object < T > {
    [key: string]: T
}

export interface VoiceFile {
    index: string[];
    [key: string]: any;
}

export interface UserVoiceState {
    listening: boolean;
    since?: Date;
}

export const DAY_AS_MS = 86400000; // 1 day in milliseconds

export abstract class AClient extends Discord.Client {

    modules: Discord.Collection < string,
    IBotModule > ;
    langs: Discord.Collection < string,
    Object < string > > ;
    lang: string;
    connection_status: boolean;
    sheets: sheets_v4.Sheets;
    guild: Discord.Guild;
    configPath: string;
    voicelog: Discord.Collection <string, UserVoiceState>;
    voicelogtxt: VoiceFile;
    [key: string]: any;

    checkAuthorizaton(user: Discord.User): number {return};

    curentLang(): Object < string > {return};
}