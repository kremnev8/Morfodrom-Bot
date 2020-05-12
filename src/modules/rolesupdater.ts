import util = require('../utilites.js');
import { sprintf } from 'sprintf-js';
import Discord = require('discord.js');
import * as types from '../index';

let bots: Discord.TextChannel;
let clanRoles: string[];
let userStates: string[];
let count: number = 0;

function DataReady(client: types.AClient) {

    count++;
    if (count == 2) {
        client.clanRoles = clanRoles;
        client.userStates = userStates;
        if (client.clanRoles == undefined || client.userStates == undefined) {
            global.logger.error("Error initializing constants! Exiting now!");
            global.logger.info(client.clanRoles);
            global.logger.info(client.userStates);
            process.exit();
        }
        else {
            global.logger.info("Constants initialized:");
            global.logger.info(client.clanRoles);
            global.logger.info(client.userStates);
        }
    }
}



class RolesUpdater implements types.IIntervalModule {
    name = "rolesinterval";
    manual = false;

    init(client: types.AClient) {

        bots = client.guild.channels.cache.get("561529244220653578") as Discord.TextChannel;

        client.on('guildMemberAdd', member => {
            if (!member.user.bot) {
                member.send(sprintf(client.curentLang().welcome));
                member.roles.add('394957292581158923');
            }
        });


        client.sheets.spreadsheets.values.get({
            spreadsheetId: client.sID,
            range: "Участники!X2:X9",
            majorDimension: "COLUMNS",
        }, (err, result) => {
            if (err) {
                global.logger.warn(err);
            }
            else {
                clanRoles = result.data.values[0];
                DataReady(client);
            }
        });
        client.sheets.spreadsheets.values.get({
            spreadsheetId: client.sID,
            range: "Участники!Y2:Y9",
            majorDimension: "COLUMNS",
        }, (err, result) => {
            if (err) {
                global.logger.warn(err);
            }
            else {
                userStates = result.data.values[0];
                DataReady(client);
            }
        });

    }

    getInterval(client: types.AClient) {
        return client.win ? 60000 : 1800000;
    }

    execute(client: types.AClient) {
        if (client.sheets) {
            client.sheets.spreadsheets.values.get({
                spreadsheetId: client.sID,
                range: `Участники!B2:${client.lastLetter}102`,
            }, (err, result) => {
                if (err) {
                    global.logger.warn(err);
                }
                else {
                    const table: string[][] = result.data.values;

                    for (let i = 0; i < table.length; i++) {
                        const member: string[] = table[i];
                        if (member[2] === client.clanRoles[0] /* Новобранец*/ && member[4] === client.userStates[0] /* Активен*/ ) {
                            const djoin = util.RuDateParse(member[1]);
                            const now = new Date();
                            const diff = now.getTime() - djoin.getTime();
                            if (diff >= 432000000) {
                                try {
                                    bots.send(sprintf(client.curentLang().userisold, member[0]));
                                    member[2] = client.clanRoles[1]; // Солдат
                                    global.logger.debug(`Clan member ${member[0]} should be promoted now.`);

                                    const res = [member];

                                    client.sheets.spreadsheets.values.update({
                                        spreadsheetId: client.sID,
                                        range: `Участники!B${i + 2}:${client.lastLetter}${i + 2}`,
                                        valueInputOption: 'USER_ENTERED',
                                        requestBody: {
                                            values: res,
                                        },
                                    }, function(err, response) {
                                        if (err) {
                                            global.logger.warn(err);
                                            return;
                                        }
                                    });
                                }
                                catch (error) {
                                    global.logger.warn(error);
                                }

                            }
                        }
                        else if ((member[4] === client.userStates[6] /* Покинул клан*/ || member[4] === client.userStates[5] /* Изгнан*/ ) && member[6]) {
                            const id = member[6];
                            if (id) {
                                const dmember = client.guild.members.cache.get(id);
                                if (dmember) {
                                    if (dmember.roles.cache.has("394957292581158923")) {
                                        global.logger.info(`${dmember.displayName} no longer is in clan!`)
                                        dmember.roles.remove('394957292581158923', 'Участник более не состоит в клане Warframe');
                                        dmember.roles.add("586270815218171918");
                                    }
                                }
                                else {
                                    global.logger.info(`user ${member[0]} left discord server`)
                                    member[6] = "";
                                    member[7] = "-";

                                    const res = [member];

                                    client.sheets.spreadsheets.values.update({
                                        spreadsheetId: client.sID,
                                        range: `Участники!B${i + 2}:${client.lastLetter}${i + 2}`,
                                        valueInputOption: 'USER_ENTERED',
                                        requestBody: {
                                            values: res,
                                        },
                                    }, function(err, response) {
                                        if (err) {
                                            global.logger.warn(err);
                                            return;
                                        }
                                    });

                                }
                            }
                        }
                        else if (member[4] === client.userStates[7] /* Принят обратно*/ ) {
                            const id = member[6];
                            if (id) {
                                const dmember = client.guild.members.cache.get(id);
                                if (dmember) {
                                    global.logger.info(`${dmember.displayName} rejoined us!`)
                                    if (dmember.roles.cache.has("586270815218171918")) {
                                        dmember.roles.remove('586270815218171918', 'Участник снова состоит в клане Warframe');
                                    }
                                    dmember.roles.add('394957292581158923');
                                    member[4] = client.userStates[0]; // Активен

                                    let res = [member];

                                    client.sheets.spreadsheets.values.update({
                                        spreadsheetId: client.sID,
                                        range: `Участники!B${i + 2}:${client.lastLetter}${i + 2}`,
                                        valueInputOption: 'USER_ENTERED',
                                        requestBody: {
                                            values: res,
                                        },
                                    }, function(err, response) {
                                        if (err) {
                                            global.logger.warn(err);
                                            return;
                                        }
                                    });
                                }

                            }

                        }
                    }
                }
            });
        }
        else {
            global.logger.error("Error: couldn't connect to google sheets!");
        }
    }
}

export = new RolesUpdater();