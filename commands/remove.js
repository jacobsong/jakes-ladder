const { SlashCommandBuilder } = require('@discordjs/builders');
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

        if (deleteResult.deletedCount === 0) {
            interaction.reply(`${target.tag} is not on the leaderboard`);
            return;
        }

        interaction.reply(`**Success**: Deleted user ${target.tag}`);
    }
};