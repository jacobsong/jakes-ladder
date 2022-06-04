const Discord = require('discord.js');
const Player = require('../models/Player');
const validator = require('./validator');

const help = (msg) => {
    const embed = new Discord.MessageEmbed()
        .setTitle('Command List')
        .setColor('BLUE')
        .addField('**register**', '- Registers yourself')
        .addField('**register** *<user>*', '- Registers the mentioned user')
        .addField('**unregister** *<userID>*', '- Unregisters the user ID')
        .addField('**ducknofades**', '- Shows what ELO scores you should challenge')
        .addField('**decay**', '- Decays ELO for players that have not played a match in 7 days')
        .addField('**record** *<user>* *<games-won>* *<user>* *<games-won>*',
            ['- Records a match between 2 players', '- Example: `=record @vizi 3 @sack 1`']);

    msg.channel.send(embed);
};

const register = async (msg) => {
    if (validator.isCommand(msg)) {
        let playerId = msg.author.id;
        let playerName = msg.author.username;
        let playerMember = msg.member;

        const result = validator.checkArgs(msg);
        if (result.errors) {
            msg.channel.send(result.errors);
            return;
        }
        if (result.numArgs > 0) {
            const errors = validator.checkMod(msg);
            if (errors) {
                msg.channel.send(errors);
                return;
            }
            playerId = msg.mentions.users.first().id;
            playerName = msg.mentions.users.first().username;
            playerMember = msg.mentions.members.first();
        }

        const memberErrors = validator.checkMember(playerMember);
        if (memberErrors) {
            msg.channel.send(memberErrors);
            return;
        }

        const embed = new Discord.MessageEmbed();

        try {
            const existingPlayer = await Player.find({ discordId: playerId }).limit(1);

            if (existingPlayer.length) {
                embed.setColor('GREEN');
                embed.setDescription('Already registered');
                msg.channel.send(embed);
                return;
            }

            await new Player({
                discordId: playerId,
                discordName: playerName
            }).save();

            embed.setColor('GREEN');
            embed.setDescription(`**Success**, registered ${playerName}`);
            msg.channel.send(embed);

        }
        catch {
            embed.setColor('RED');
            embed.setDescription('Database error');
            msg.channel.send(embed);
        }
    }
};

const unregister = async (msg) => {
    if (validator.isCommand(msg)) {
        const modErrors = validator.checkMod(msg);
        if (modErrors) {
            msg.channel.send(modErrors);
            return;
        }

        const embed = new Discord.MessageEmbed().setColor('RED');
        const msgArr = msg.content.split(' ');

        if (msgArr.length - 1 === 0) {
            embed.setDescription('**Error**: Did not specify a user ID');
            msg.channel.send(embed);
            return;
        }
        if (msgArr.length - 1 > 1) {
            embed.setDescription('**Error**: Too many parameters');
            msg.channel.send(embed);
            return;
        }

        try {
            const result = await Player.deleteOne({ discordId: msgArr[1] });
            if (result.deletedCount === 0) {
                embed.setDescription('That User ID does not exist');
                msg.channel.send(embed);
                return;
            }
            embed.setColor('GREEN');
            embed.setDescription('**Success**: Deleted user ID ' + msgArr[1]);
            msg.channel.send(embed);
        }
        catch {
            embed.setDescription('Database error');
            msg.channel.send(embed);
        }
    }
};

const decay = async (msg) => {
    const modErrors = validator.checkMod(msg);
    if (modErrors) {
        msg.channel.send(modErrors);
        return;
    }
    const embed = new Discord.MessageEmbed();

    try {
        const sevenDays = 7 * (24 * 60 * 60 * 1000);
        const lastWeek = new Date(Date.now() - sevenDays);
        const players = await Player.find({ lastMatch: { $lte: lastWeek }, elo: { $gte: 700 } }).select('discordName elo').sort({ elo: -1 });

        if (players.length > 0) {
            let decayList = '```';
            await players.forEach((player) => {
                const oldELO = player.elo;
                const newELO = Math.round(player.elo * 0.95);
                player.elo = newELO;
                player.save();
                decayList += `${oldELO} => ${newELO} - ${player.discordName}\n`;
            });
            decayList += '```';
            embed.setTitle('These players had their ELO decay');
            embed.setColor('GREEN');
            embed.setDescription(decayList);
            msg.channel.send(embed);
            return;
        }
        embed.setColor('BLUE');
        embed.setDescription('No players found to decay');
        msg.channel.send(embed);
    }
    catch {
        embed.setColor('RED');
        embed.setDescription('Database error');
        msg.channel.send(embed);
    }
};

const record = async (msg) => {
    if (validator.isCommand(msg)) {
        const modErrors = validator.checkMod(msg);
        if (modErrors) {
            msg.channel.send(modErrors);
            return;
        }

        const argErrors = validator.checkRecordArgs(msg);
        if (argErrors) {
            msg.channel.send(argErrors);
            return;
        }

        const embed = new Discord.MessageEmbed();
        const msgArr = msg.content.split(' ');
        const firstId = msgArr[1].replace(/[<@!>]/g, '');
        const secondId = msgArr[3].replace(/[<@!>]/g, '');

        try {
            const firstExists = await Player.find({ discordId: firstId }).limit(1);
            const secondExists = await Player.find({ discordId: secondId }).limit(1);

            if (firstExists.length === 0) {
                embed.setColor('RED');
                embed.setDescription(`${msgArr[1]} is not registered`);
                msg.channel.send(embed);
                return;
            }

            if (secondExists.length === 0) {
                embed.setColor('RED');
                embed.setDescription(`${msgArr[3]} is not registered`);
                msg.channel.send(embed);
                return;
            }

            const firstGames = Number(msgArr[2]);
            const secondGames = Number(msgArr[4]);
            let winnerId;
            let loserId;
            let winnerGames;
            let loserGames;

            if (firstGames > secondGames) {
                winnerId = firstId;
                winnerGames = firstGames;
                loserId = secondId;
                loserGames = secondGames;
            }
            else {
                winnerId = secondId;
                winnerGames = secondGames;
                loserId = firstId;
                loserGames = firstGames;
            }

            const winner = await Player.findOne({ discordId: winnerId }).select('discordId discordName wins elo lastMatch streak bounty prize');
            const loser = await Player.findOne({ discordId: loserId }).select('discordId discordName losses elo lastMatch streak bounty prize');
            const newELOs = calculateELO(winner.elo, loser.elo, winnerGames, loserGames);

            const winnerOldELO = winner.elo;
            const loserOldELO = loser.elo;

            winner.wins += 1;
            winner.elo = newELOs.winnerRating;
            winner.lastMatch = Date.now();
            loser.losses += 1;
            loser.elo = newELOs.loserRating;
            loser.lastMatch = Date.now();

            const winnerMember = await msg.guild.members.fetch(winnerId);
            const loserMember = await msg.guild.members.fetch(loserId);
            const bountyRole = msg.guild.roles.cache.find(role => role.name === 'Bounty');
            let eloFieldMsg = '';

            winner.streak += 1;
            loser.streak = 0;

            let footer = '';

            if (winner.bounty) {
                if (winner.prize < 50 && (winner.streak % 2 === 1)) {
                    winner.prize += 5;
                    footer += `💰 ${winner.discordName}'s bounty grows (${winner.prize} ELO)\n`;
                }
            }
            else if (winner.streak === 3) {
                winner.bounty = true;
                winner.prize = 15;
                footer += `💰 ${winner.discordName} now has a bounty (15 ELO)\n`;
                await winnerMember.roles.add(bountyRole);
            }

            if (loser.bounty) {
                winner.elo += loser.prize;
                loser.bounty = false;
                await loserMember.roles.remove(bountyRole);
                footer += `💰 ${winner.discordName} has taken the bounty (${loser.prize} ELO)\n`;
                eloFieldMsg = `\`\`\`ELO:  ${winnerOldELO} => ${newELOs.winnerRating} + ${loser.prize}\`\`\``;
                loser.prize = 0;
            }
            else {
                eloFieldMsg = `\`\`\`ELO:  ${winnerOldELO} => ${newELOs.winnerRating}\`\`\``;
            }

            await winner.save();
            await loser.save();

            embed.setColor('AQUA');
            embed.setDescription(`${winner.discordName} wins ${winnerGames}-${loserGames}`);
            embed.setThumbnail('https://cdn.discordapp.com/emojis/590002598338363423.png?v=1');
            embed.addField(`${winner.discordName}`, eloFieldMsg);
            embed.addField(`${loser.discordName}`, `\`\`\`ELO:  ${loserOldELO} => ${newELOs.loserRating}\`\`\``);
            embed.setFooter(footer);
            msg.channel.send(embed);
        }
        catch (e) {
            console.log(e);
            embed.setColor('RED');
            embed.setDescription('Database error');
            msg.channel.send(embed);
        }
    }
};

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

const ducknofades = async (msg) => {
    const memberErrors = validator.checkMember(msg.member);
    if (memberErrors) {
        msg.channel.send(memberErrors);
        return;
    }

    const embed = new Discord.MessageEmbed();

    try {
        const player = await Player.findOne({ discordId: msg.author.id }).select('elo').lean();

        if (!player) {
            embed.setColor('RED');
            embed.setDescription('You are not registered, stop ducking fades and register now');
            msg.channel.send(embed);
            return;
        }

        const upperBound = Math.round((Math.log10(((1 / 0.4) - 1)) * 400) + player.elo);
        const lowerBound = Math.round((Math.log10(((1 / 0.6) - 1)) * 400) + player.elo);

        embed.setColor([253, 117, 139]);
        embed.setTitle('Duck No Fades Bonus');
        embed.setDescription('When you fight other players around the same ELO as you, you will get a boost.\nIf you win, you will earn more points than normal.\nIf you lose, you will lose less points than normal');
        embed.addField('For you, you should fight players with:', `\`\`\`ELO: ${lowerBound} - ${upperBound}\`\`\``);
        msg.channel.send(embed);
    }
    catch {
        embed.setColor('RED');
        embed.setDescription('Database error');
        msg.channel.send(embed);
    }
};

module.exports = {
    help,
    register,
    unregister,
    decay,
    record,
    ducknofades
};
