const Discord = require('discord.js');
const validMod = 'Super Villains';
const validStaff = 'Staff';

const checkRecordArgs = (msg) => {
    const msgArr = msg.content.split(' ');
    const errors = new Discord.MessageEmbed();
    const gamesWon1 = Number(msgArr[2]);
    const gamesWon2 = Number(msgArr[4]);

    if (msgArr.length - 1 != 4) {
        errors.setColor('RED');
        errors.setDescription(`**Error**: expected **4** parameters, received **${msgArr.length - 1}**`);
        return errors;
    }

    if (msg.mentions.members.size != 2) {
        errors.setColor('RED');
        errors.setDescription(`**Error**: expected **2** mentions, received **${msg.mentions.members.size}**`);
        return errors;
    }

    if (isNaN(gamesWon1) || isNaN(gamesWon2)) {
        errors.setColor('RED');
        errors.setDescription('**Error**: <games-won> should be a number');
        return errors;
    }

    if (gamesWon1 > 3 || gamesWon1 < 0 || gamesWon2 > 3 || gamesWon2 < 0) {
        errors.setColor('RED');
        errors.setDescription('**Error**: <games-won> should be between 0 and 3');
        return errors;
    }

    if ((gamesWon1 + gamesWon2) > 5) {
        errors.setColor('RED');
        errors.setDescription('**Error**: total games should be less than 5');
        return errors;
    }

    if (gamesWon1 < 3 && gamesWon2 < 3) {
        errors.setColor('RED');
        errors.setDescription('**Error**: at least one player needs to win 3 games');
        return errors;
    }
};

const hasPermissions = (interaction, command) => {
    if (command.adminRequired) {
        if (interaction.member.roles.cache.some((role) => (role.name === validMod) || (role.name === validStaff))) {
            return true;
        }
        else {
            interaction.reply('You are not a mod');
            return false;
        }
    }
    else {
        return true;
    }
};

module.exports = {
    hasPermissions,
    checkRecordArgs
};