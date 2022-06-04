const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Player = require('../models/Player');

module.exports = {
    adminRequired: true,
    data: new SlashCommandBuilder()
        .setName('new-season')
        .setDescription('Reset the leaderboard for a new season'),
    async execute(interaction) {
        const embed = new MessageEmbed().setColor('GREEN').setDescription('**Success**, leaderboard has been deleted. New season begins.');
        await Player.deleteMany({});
        interaction.reply({ embeds: [embed] });
    }
};