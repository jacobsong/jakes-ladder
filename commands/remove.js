const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const Player = require('../models/Player');

module.exports = {
    adminRequired: true,
    data: new SlashCommandBuilder()
        .setName('remove')
        .setDescription('Remove a player from the leaderboard')
        .addUserOption(option => option.setName('user').setDescription('The user to remove').setRequired(true)),
    async execute(interaction) {
        const target = interaction.options.getUser('user');
        const deleteResult = await Player.deleteOne({ discordId: target.id });

        if (deleteResult.deletedCount) {
            const embed = new MessageEmbed().setColor('GREEN').setDescription(`**Success**, deleted user ${target.tag} from the leaderboard`);
            interaction.reply({ embeds: [embed] });
            return;
        }

        interaction.reply({ content: `${target.tag} is not on the leaderboard`, ephemeral: true });
    }
};