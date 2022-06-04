const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { codeBlock } = require('@discordjs/builders');
const Player = require('../models/Player');

module.exports = {
    adminRequired: false,
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Returns stats for yourself or the mentioned user')
        .addUserOption(option => option.setName('user').setDescription('The user to lookup')),
    async execute(interaction) {
        let player = interaction.user;
        const target = interaction.options.getUser('user');

        if (target) {
            player = target;
        }

        const embed = new MessageEmbed();
        const playerProfile = await Player.findOne({ discordId: player.id }).lean();

        if (playerProfile) {
            const days = Math.round((Date.now() - playerProfile.lastMatch.getTime()) / (24 * 60 * 60 * 1000));
            let dayText = ' ';
            const stats = `ELO:    ${playerProfile.elo}\nWins:   ${playerProfile.wins}\nLosses: ${playerProfile.losses}\nStreak: ${playerProfile.streak || 0}`;

            if (days === 0) dayText = 'Today';
            if (days === 1) dayText = 'Yesterday';
            if (days > 1) dayText = `${days} days ago`;
            if (playerProfile.bounty) {
                embed.setAuthor({ name: `⭐ Bounty ${playerProfile.prize} ELO` });
            }

            embed.setColor('LUMINOUS_VIVID_PINK');
            embed.setTitle(player.tag);
            embed.setThumbnail(player.avatarURL({ dynamic: true }));
            embed.setDescription(codeBlock(stats));
            embed.setFooter({ text: `Last match played: ${dayText}` });
            interaction.reply({ embeds: [embed] });
            return;
        }

        embed.setColor('BLUE');
        embed.setDescription(`${player.tag} has not played any matches`);
        interaction.reply({ embeds: [embed] });
    }
};