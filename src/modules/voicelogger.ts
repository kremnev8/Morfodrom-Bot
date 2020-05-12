import util = require('../utilites.js');
import Discord = require('discord.js');
import * as types from '../index';

class VoiceLoggger implements types.IIntervalModule {
    name = "voicelogger";
    manual = true;
    interval = types.DAY_AS_MS;

    init(client: types.AClient) {
        client.voicelog = new Discord.Collection();
        client.voicelogtxt = util.loadJson(`${client.configPath}/voicelog`) as types.VoiceFile;

        client.guild.channels.cache.each(channel => {
            if (channel.type == "voice" && channel.id != client.guild.afkChannelID) {
                channel.members.each(member => {
                    if (!member.voice.deaf) {
                        client.voicelog.set(member.id, { listening: true, since: new Date()});
                        global.vlogger.info(`User ${member.displayName} is already in a channel ${member.voice.channel.name}`);
                    }else {
                        global.vlogger.info(`User ${member.displayName} is already in a channel ${member.voice.channel.name}, but he/she is muted!`);
                    }
                });
            }
        });

        client.on('voiceStateUpdate', (oldm: Discord.VoiceState, newm: Discord.VoiceState) => {
            this.voiceUpdate(client, oldm, newm);
        });

        var now = new Date();
        var millisTill12 = (new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0)).getTime() - now.getTime();
        if (millisTill12 < 0) {
            millisTill12 += this.interval; // it's after 12am, try 12am tomorrow.
        }


        setTimeout(() => {
            this.execute(client);
            setInterval(() => {
                this.execute(client);
            }, this.interval);
        }, millisTill12);

        setInterval(() => {
            this.saveCurrentVoiceChannelData(client);

            if (!client.connection_status) {
                client.voicelog = new Discord.Collection();
            }
        }, client.win ? 60000 : 1800000);
    }

    saveCurrentVoiceChannelData(client: types.AClient) {
        client.voicelog.each((state, id, map) => {
            if (state[0]) {
                const since: Date = state.since;
                const now = new Date();
                const time = Math.floor((now.getTime() - since.getTime()) / 1000);
                const date = `${since.getDate()}.${since.getMonth()+1}.${since.getFullYear()-2000}`
                if (!client.voicelogtxt[date]) {
                    client.voicelogtxt[date] = {};
                }
                let timeSpent: number = client.voicelogtxt[date][id];
                if (!timeSpent) {
                    timeSpent = 0;
                }
                timeSpent += time;
                client.voicelogtxt[date][id] = timeSpent;

                if (!client.voicelogtxt["index"]) {
                    client.voicelogtxt["index"] = [];
                }
                const index = client.voicelogtxt["index"];

                let found = false;
                for (let i = 0; i < index.length; i++) {
                    const iuser = index[i];
                    if (iuser == id) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    index.push(id)
                }
                util.saveJson(`${client.configPath}/voicelog`, client.voicelogtxt);
                map.set(id, {listening: true, since: now})
            }
        });
    }

    execute(client: types.AClient) {

        const now = new Date();
        const weekago = new Date(now.getTime() - types.DAY_AS_MS * 7);
        const newindex: string[] = [];

        const keys = Object.keys(client.voicelogtxt);
        keys.forEach(key => {
            if (key != "index") {
                const time = util.RuDateParse(`${key} 00:00`)
                if (time <= weekago) {
                    global.logger.info(`${key} is too old`);
                    client.voicelogtxt[key] = undefined;
                } else {
                    const tablek = Object.keys(client.voicelogtxt[key]);

                    tablek.forEach(id => {
                        let found = false;
                        for (let i = 0; i < newindex.length; i++) {
                            const iuser = newindex[i];
                            if (iuser == id) {
                                found = true;
                            }
                        }
                        if (!found) {
                            newindex.push(id)
                        }
                    });
                }
            }
        });

        client.voicelogtxt["index"] = newindex;

        util.saveJson(`${client.configPath}/voicelog`, client.voicelogtxt);
    }

    voiceUpdate(client: types.AClient, oldm: Discord.VoiceState, newm: Discord.VoiceState) {
        if (oldm.channel != null && newm.channel == null) {
            // left
            if (oldm.channelID != client.guild.afkChannelID) {
                const currentState = client.voicelog.get(oldm.id);
                if (currentState && currentState.listening) {

                    const since = currentState.since;
                    const now = new Date();
                    const time = Math.floor((now.getTime() - since.getTime()) / 1000);
                    global.vlogger.info(`User ${oldm.member.displayName} spent ${time} s in voice chat!`);

                    let date: string = `${since.getDate()}.${since.getMonth()+1}.${since.getFullYear()-2000}`;
                    if (!client.voicelogtxt[date]) {
                        client.voicelogtxt[date] = {};
                    }
                    let TimeSpent = client.voicelogtxt[date][oldm.id];
                    if (!TimeSpent) {
                        TimeSpent = 0;
                    }
                    TimeSpent += time;
                    client.voicelogtxt[date][oldm.id] = TimeSpent;

                    if (!client.voicelogtxt["index"]) {
                        client.voicelogtxt["index"] = [];
                    }
                    const index = client.voicelogtxt["index"];

                    let found = false;
                    for (let i = 0; i < index.length; i++) {
                        const iuser = index[i];
                        if (iuser == oldm.id) {
                            found = true;
                        }
                    }
                    if (!found) {
                        index.push(oldm.id)
                    }

                    util.saveJson(`${client.configPath}/voicelog`, client.voicelogtxt);
                    client.voicelog.set(oldm.id, {listening: false});
                }
            }
            global.vlogger.info(`User ${oldm.member.displayName} just left channel ${oldm.channel.name}`);
        } else if (oldm.channel == null && newm.channel != null) {
            // joined
            if (newm.channelID != client.guild.afkChannelID && !newm.deaf) {
                global.vlogger.info(`User ${newm.member.displayName} just joined channel ${newm.channel.name}`);
                client.voicelog.set(newm.id, {listening: true, since: new Date()});
            }else if (newm.deaf){
                global.vlogger.info(`User ${newm.member.displayName} just joined channel ${newm.channel.name}, but he/she is muted!`);
            }
        } else if (oldm.channel != newm.channel) {
            if (newm.channelID == client.guild.afkChannelID) {
                // joined afk
                const currentState = client.voicelog.get(oldm.id);
                if (currentState && currentState.listening) {

                    const since = currentState.since;
                    const now = new Date();
                    const time = Math.floor((now.getTime() - since.getTime()) / 1000);
                    global.vlogger.info(`User ${oldm.member.displayName} spent ${time} s in voice chat!`);
                    global.vlogger.info(`User ${newm.member.displayName} now is AFK`);
                    
                    let date: string = `${since.getDate()}.${since.getMonth()+1}.${since.getFullYear()-2000}`;
                    if (!client.voicelogtxt[date]) {
                        client.voicelogtxt[date] = {};
                    }
                    let TimeSpent = client.voicelogtxt[date][oldm.id];
                    if (!TimeSpent) {
                        TimeSpent = 0;
                    }
                    TimeSpent += time;
                    client.voicelogtxt[date][oldm.id] = TimeSpent;

                    if (!client.voicelogtxt["index"]) {
                        client.voicelogtxt["index"] = [];
                    }
                    const index = client.voicelogtxt["index"];

                    let found = false;
                    for (let i = 0; i < index.length; i++) {
                        const iuser = index[i];
                        if (iuser == oldm.id) {
                            found = true;
                        }
                    }
                    if (!found) {
                        index.push(oldm.id)
                    }

                    util.saveJson(`${client.configPath}/voicelog`, client.voicelogtxt);
                    client.voicelog.set(oldm.id, {listening: false});
                }
            } else if (oldm.channelID == client.guild.afkChannelID) {
                // left afk
                global.vlogger.info(`User ${newm.member.displayName} is no longer AFK`);
                client.voicelog.set(newm.id, {listening: true, since: new Date()});
            }
            global.vlogger.info(`User ${newm.member.displayName} just changed channel from ${oldm.channel.name} to ${newm.channel.name}`);
        }else if (newm.channel != null && !newm.deaf) {
            // unmuted
            if (newm.channelID != client.guild.afkChannelID) {
                client.voicelog.set(newm.id, {listening: true, since: new Date()});
            }
            global.vlogger.info(`User ${newm.member.displayName} just unmuted himself/herself`);
        }else if (newm.channel != null && newm.deaf) {
            // muted
            if (newm.channelID != client.guild.afkChannelID) {
                const currentState = client.voicelog.get(oldm.id);
                if (currentState && currentState.listening) {

                    const since = currentState.since;
                    const now = new Date();
                    const time = Math.floor((now.getTime() - since.getTime()) / 1000);
                    global.vlogger.info(`User ${oldm.member.displayName} spent ${time} s in voice chat!`);

                    let date: string = `${since.getDate()}.${since.getMonth()+1}.${since.getFullYear()-2000}`;
                    if (!client.voicelogtxt[date]) {
                        client.voicelogtxt[date] = {};
                    }
                    let TimeSpent = client.voicelogtxt[date][oldm.id];
                    if (!TimeSpent) {
                        TimeSpent = 0;
                    }
                    TimeSpent += time;
                    client.voicelogtxt[date][oldm.id] = TimeSpent;

                    if (!client.voicelogtxt["index"]) {
                        client.voicelogtxt["index"] = [];
                    }
                    const index = client.voicelogtxt["index"];

                    let found = false;
                    for (let i = 0; i < index.length; i++) {
                        const iuser = index[i];
                        if (iuser == oldm.id) {
                            found = true;
                        }
                    }
                    if (!found) {
                        index.push(oldm.id)
                    }

                    util.saveJson(`${client.configPath}/voicelog`, client.voicelogtxt);
                    client.voicelog.set(oldm.id, {listening: false});
                }
            }
            global.vlogger.info(`User ${newm.member.displayName} just muted himself/herself`);
        }
    }
}

export = new VoiceLoggger();