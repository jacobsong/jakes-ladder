const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { codeBlock } = require('@discordjs/builders');
const Player = require('../models/Player');

module.exports = {
    adminRequired: false,
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Shows the leaderboard'),
    async execute(interaction) {
        const embed = new MessageEmbed();
        const players = await Player.find({}).select('elo discordName').sort({ elo: -1 }).lean();

        let board = '';
        for (let index = 0; index < players.length; index++) {
            board += `#${index + 1} - ELO: ${players[index].elo} ${players[index].discordName.substring(0, 14)}\n`;
        }

        embed.setTitle('Leaderboard');
        embed.setColor('GOLD');
        embed.setDescription(codeBlock(board));
        interaction.reply({ embeds: [embed] });

    },
};