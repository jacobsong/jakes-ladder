const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const utils = require('../utils/utils');

module.exports = {
    adminRequired: false,
    data: new SlashCommandBuilder()
        .setName('record-game')
        .setDescription('Records a match between 2 players')
        .addUserOption(option => option.setName('winner').setDescription('The winner of the match').setRequired(true))
        .addUserOption(option => option.setName('loser').setDescription('The loser of the match').setRequired(true))
        .addIntegerOption(option => option.setName('loser-games').setDescription('The loser\'s game count').setRequired(true).addChoices(
            { name: '0', value: 0 },
            { name: '1', value: 1 },
            { name: '2', value: 2 })),
    async execute(interaction) {
        const embed = new MessageEmbed();
        const winner = interaction.options.getUser('winner');
        const loser = interaction.options.getUser('loser');
        const winnerGames = 3;
        const loserGames = interaction.options.getInteger('loser-games');

        embed.setAuthor({ name: `${winner.username} won ${winnerGames} - ${loserGames}`, iconURL: winner.avatarURL({ dynamic: true }) });
        embed.setTitle(`${loser.username} please confirm the results`);
        embed.setDescription(`👑 **Winner:** ${winner.username}\n❌ **Loser:** ${loser.username}`);
        embed.setColor('GREEN');
        embed.setFooter({ text: 'The loser must react with ✅ in order for the set to be recorded', iconURL: loser.avatarURL({ dynamic: true }) });

        try {
            const message = await interaction.reply({ content: `${winner} ${loser} ranked match confirmation`, embeds: [embed], fetchReply: true });
            await message.react('✅');

            const filter = (reaction, user) => {
                return reaction.emoji.name === '✅' && user.id === loser.id;
            };

            const collected = await message.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] });

            if (collected.size) {
                message.reactions.removeAll();
                utils.recordGame(interaction, winner, loser, winnerGames, loserGames);
            }
        }
        catch (e) {
            interaction.user.send('Your opponent did not verify the results within 1 minute');
            return;
        }
    }
};