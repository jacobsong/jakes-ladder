const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Player = require('../models/Player');

module.exports = {
    adminRequired: true,
    data: new SlashCommandBuilder()
        .setName('reset')
        .setDescription('Reset a player\'s stats')
        .addUserOption(option => option.setName('user').setDescription('The user to reset').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const updateResult = await Player.updateOne({ discordId: target.id }, { $set: { elo: 1000, wins: 0, losses: 0, streak: 0, bounty: false, prize: 0 } });

        if (updateResult.modifiedCount) {
            const embed = new MessageEmbed().setColor('GREEN').setDescription(`**Success**, stats have been reset for ${target.tag}`);
            interaction.reply({ embeds: [embed] });
            return;
        }

        interaction.reply({ content: `${target.tag} is not on the leaderboard`, ephemeral: true });
    }
};