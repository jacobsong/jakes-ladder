const { MessageEmbed } = require('discord.js');
const { codeBlock } = require('@discordjs/builders');
const Player = require('../models/Player');

const calculateELO = (winnerELO, loserELO, winnerGames, loserGames) => {
    const k = 20 * (winnerGames - loserGames);
    const winnerProb = (1.0 / (1.0 + Math.pow(10, ((loserELO - winnerELO) / 400))));
    const loserProb = (1.0 / (1.0 + Math.pow(10, ((winnerELO - loserELO) / 400))));
    let winnerK = k;
    let loserK = k;

    if (winnerProb >= 0.4 && winnerProb <= 0.6) {
        winnerK = k * 1.5;
        loserK = k / 1.5;
    }

    const winnerRating = Math.round(winnerELO + winnerK * (1 - winnerProb));
    const loserRating = Math.round(loserELO + loserK * (0 - loserProb));

    return ({ winnerRating, loserRating });
};

const recordGame = async (interaction, winner, loser, winnerGames, loserGames) => {
    let winnerPlayer = await Player.findOne({ discordId: winner.id });
    let loserPlayer = await Player.findOne({ discordId: loser.id });

    if (winnerPlayer === null) {
        winnerPlayer = new Player({ discordId: winner.id, discordName: winner.username });
    }

    if (loserPlayer === null) {
        loserPlayer = new Player({ discordId: loser.id, discordName: loser.username });
    }

    const newELOs = calculateELO(winnerPlayer.elo, loserPlayer.elo, winnerGames, loserGames);
    const winnerOldELO = winnerPlayer.elo;
    const loserOldELO = loserPlayer.elo;

    winnerPlayer.wins += 1;
    winnerPlayer.elo = newELOs.winnerRating;
    winnerPlayer.lastMatch = Date.now();
    loserPlayer.losses += 1;
    loserPlayer.elo = newELOs.loserRating;
    loserPlayer.lastMatch = Date.now();
    winnerPlayer.streak += 1;
    loserPlayer.streak = 0;

    let eloFieldMsg = '';
    let footer = '';

    if (winnerPlayer.bounty) {
        if (winnerPlayer.prize < 50 && (winnerPlayer.streak % 2 === 1)) {
            winnerPlayer.prize += 5;
            footer += `💰 ${winnerPlayer.discordName}'s bounty grows (${winnerPlayer.prize} ELO)\n`;
        }
    }
    else if (winnerPlayer.streak === 3) {
        winnerPlayer.bounty = true;
        winnerPlayer.prize = 15;
        footer += `💰 ${winnerPlayer.discordName} now has a bounty (15 ELO)\n`;
    }

    if (loserPlayer.bounty) {
        winnerPlayer.elo += loserPlayer.prize;
        loserPlayer.bounty = false;
        footer += `💰 ${winnerPlayer.discordName} has taken the bounty (${loserPlayer.prize} ELO)\n`;
        eloFieldMsg = `ELO:  ${winnerOldELO} => ${newELOs.winnerRating} + ${loserPlayer.prize}`;
        loserPlayer.prize = 0;
    }
    else {
        eloFieldMsg = `ELO:  ${winnerOldELO} => ${newELOs.winnerRating}`;
    }

    await winnerPlayer.save();
    await loserPlayer.save();

    const embed = new MessageEmbed().setColor('#0099ff')
        .setDescription(`${winner.username} won ${winnerGames}-${loserGames}`)
        .setThumbnail('https://cdn.discordapp.com/emojis/590002598338363423.png?v=1')
        .addField(`${winner.username}`, codeBlock(eloFieldMsg))
        .addField(`${loser.username}`, codeBlock(`ELO:  ${loserOldELO} => ${newELOs.loserRating}`))
        .setFooter({ text: footer });

    await interaction.editReply({ content: `${winner} ${loser} Ranked match confirmed`, embeds: [embed], components: [] });
};

module.exports = {
    calculateELO,
    recordGame
};
