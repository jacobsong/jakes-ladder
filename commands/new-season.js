const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { MessageActionRow, MessageButton } = require('discord.js');
const Player = require('../models/Player');

module.exports = {
    adminRequired: true,
    data: new SlashCommandBuilder()
        .setName('new-season')
        .setDescription('Reset the leaderboard for a new season'),
    async execute(interaction) {
        const row = new MessageActionRow().addComponents(
            new MessageButton().setCustomId('confirm').setLabel('Confirm').setStyle('SUCCESS'),
            new MessageButton().setCustomId('cancel').setLabel('Cancel').setStyle('DANGER'),
        );

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Are you sure you want to start a new season?')
            .setDescription('Starting a new season will delete the leaderboard.');

        const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        const filter = i => {
            i.deferUpdate();
            return i.user.id === interaction.user.id;
        };

        message.awaitMessageComponent({ filter, componentType: 'BUTTON', time: 10000 })
            .then(async i => {
                if (i.customId === 'confirm') {
                    const success = new MessageEmbed().setColor('GREEN').setDescription('**Success**, leaderboard has been deleted. New season begins.');
                    await Player.deleteMany({});
                    interaction.editReply({ embeds: [success], components: [] });
                }
                else {
                    interaction.deleteReply();
                    interaction.followUp({ content: 'You clicked cancel', ephemeral: true });
                }
            })
            .catch(() => {
                interaction.deleteReply();
                interaction.followUp({ content: 'You did not answer', ephemeral: true });
            });
    }
};