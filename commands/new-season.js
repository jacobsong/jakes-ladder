const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Player = require('../models/Player');

module.exports = {
    adminRequired: true,
    data: new SlashCommandBuilder()
        .setName('new-season')
        .setDescription('Reset the leaderboard for a new season'),
    async execute(interaction) {
        const embed = new MessageEmbed();
        await Player.deleteMany({});
        embed.setColor('GREEN');
        embed.setDescription('**Success**, leaderboard has been deleted');
        interaction.reply({ embeds: [embed] });
    }
};