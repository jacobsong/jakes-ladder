const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { codeBlock } = require('@discordjs/builders');
const Player = require('../models/Player');

module.exports = {
    adminRequired: false,
    data: new SlashCommandBuilder()
        .setName('bounties')
        .setDescription('Shows a list of people with bounties'),
    async execute(interaction) {
        const embed = new MessageEmbed().setColor('DARK_GOLD').setTitle(':moneybag: :moneybag: :moneybag:');
        const players = await Player.find({ bounty: true }).select('discordName streak bounty prize').sort({ prize: -1 }).lean();

        if (players.length) {
            players.forEach(player => {
                const bounty = `Prize:  ${player.prize} ELO\nStreak: ${player.streak} Kills`;
                embed.addField(`${player.discordName}`, codeBlock(bounty));
            });
        }
        else {
            embed.setDescription('No bounties');
        }

        interaction.reply({ embeds: [embed] });
    }
};