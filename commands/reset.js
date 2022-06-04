const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Player = require('../models/Player');

module.exports = {
    adminRequired: true,
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Resets stats for the user')
        .addUserOption(option => option.setName('user').setDescription('The user to reset').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const embed = new MessageEmbed();

        const updateResult = await Player.updateOne({ discordId: target.id }, { $set: { elo: 1000, wins: 0, losses: 0, streak: 0, bounty: false, prize: 0 } });
        if (updateResult.acknowledged) {
            embed.setColor('GREEN');
            embed.setDescription(`**Success**, stats have been reset for ${target.tag}`);
            interaction.reply({ embeds: [embed] });
            return;
        }
        embed.setColor('BLUE');
        embed.setDescription(`${target.tag} is not on the leaderboard`);
        interaction.reply({ embeds: [embed] });
        return;
    }
};