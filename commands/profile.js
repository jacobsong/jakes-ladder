const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { codeBlock } = require('@discordjs/builders');
const Player = require('../models/Player');
const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
dayjs.extend(relativeTime);

module.exports = {
    adminRequired: false,
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Show stats for yourself or the mentioned user')
        .addUserOption(option => option.setName('user').setDescription('The user to lookup')),
    async execute(interaction) {
        let player = interaction.user;
        const target = interaction.options.getUser('user');

        if (target) {
            player = target;
        }

        const playerProfile = await Player.findOne({ discordId: player.id }).lean();

        if (playerProfile) {
            const lastPlayedDate = dayjs(playerProfile.lastMatch).fromNow();
            const stats = `ELO:    ${playerProfile.elo}\nWins:   ${playerProfile.wins}\nLosses: ${playerProfile.losses}\nStreak: ${playerProfile.streak}`;
            const embed = new MessageEmbed().setColor('LUMINOUS_VIVID_PINK')
                .setTitle(player.tag)
                .setThumbnail(player.avatarURL({ dynamic: true }))
                .setDescription(codeBlock(stats))
                .setFooter({ text: `⏱️ Last match played: ${lastPlayedDate}` });

            if (playerProfile.bounty) {
                embed.setAuthor({ name: `⭐ Bounty ${playerProfile.prize} ELO` });
            }

            interaction.reply({ embeds: [embed] });
            return;
        }

        interaction.reply(`${player.tag} has not played any matches`);
    }
};