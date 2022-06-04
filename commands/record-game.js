const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { recordGame } = require('../utils/utils');
const { isValidRecord } = require('../utils/validator');

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
        const winner = interaction.options.getUser('winner');
        const loser = interaction.options.getUser('loser');

        if (!isValidRecord(interaction, winner, loser)) return;

        const winnerGames = 3;
        const loserGames = interaction.options.getInteger('loser-games');

        const embed = new MessageEmbed().setColor('PURPLE')
            .setTitle(`${loser.username}, Please confirm the results`)
            .setAuthor({ name: `${winner.username} won ${winnerGames} - ${loserGames}`, iconURL: winner.avatarURL({ dynamic: true }) })
            .setDescription(`👑 **Winner:** ${winner.username}\n❌ **Loser:** ${loser.username}`)
            .setFooter({ text: 'The loser must react with ✅ in order for the set to be recorded', iconURL: loser.avatarURL({ dynamic: true }) });

        const message = await interaction.reply({ content: `${winner} ${loser} Ranked match confirmation`, embeds: [embed], fetchReply: true });
        await message.react('✅');
        await message.react('❌');

        try {
            const filter = (reaction, user) => {
                return ['✅', '❌'].includes(reaction.emoji.name) && user.id === loser.id;
            };

            const collected = await message.awaitReactions({ filter, max: 1, time: 60000, errors: ['time'] });

            if (collected.size) {
                message.reactions.removeAll();
                if (collected.first().emoji.name === '✅') {
                    recordGame(interaction, winner, loser, winnerGames, loserGames);
                }
                else {
                    embed.setColor('RED')
                        .setTitle(`${loser.username} Rejected the results. Match not recorded.`)
                        .setFooter({ text: 'The loser rejected the results', iconURL: loser.avatarURL({ dynamic: true }) });
                    interaction.editReply({ content: `${winner} ${loser} Ranked match NOT confirmed`, embeds: [embed] });
                }
            }
        }
        catch (e) {
            message.reactions.removeAll();
            interaction.user.send('Your opponent did not verify the results within 1 minute');
            embed.setColor('RED')
                .setTitle(`${loser.username} Did NOT confirm the results. Match not recorded.`)
                .setFooter({ text: 'The loser did not respond in time', iconURL: loser.avatarURL({ dynamic: true }) });
            interaction.editReply({ content: `${winner} ${loser} Ranked match NOT confirmed`, embeds: [embed] });
            return;
        }
    }
};