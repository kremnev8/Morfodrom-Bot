import Discord = require('discord.js');

function checkAuthorizaton(guild: Discord.Guild, user: Discord.User): number {
	let authlevel: number = 0;
	try {
		let member: Discord.GuildMember = guild.member(user);
		if (member.id == "107545846580531200") {
			authlevel = 2;
		}else if (member.roles.highest.id == "395161000569208833") {
			authlevel = 1;
		}
	} catch (error){
		authlevel = 0;
	}
	return authlevel;
}

export = {
	checkAuthorizaton
}