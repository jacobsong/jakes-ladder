const Discord = require("discord.js");
const Player = require("../models/Player");
const validator = require("./validator");

const help = (msg) => {
  const embed = new Discord.RichEmbed()
    .setTitle("Command List")
    .setColor("BLUE")
    .addField("**register**", "- Registers yourself")
    .addField("**register** *<user>*", "- Registers the mentioned user")
    .addField("**profile**", "- Returns stats for yourself")
    .addField("**profile** *<user>*", "- Returns stats for the mentioned user")
    .addField("**leaderboard**", "- Shows the leaderboard")
    .addField("**reset** *<user>*", "- Resets stats for the mentioned user")
    .addField("**resetboard**", "- Resets the leaderboard")
    .addField("**decay**", "- Decays ELO for players that have not played a match in 7 days")
    .addField("**record** *<user>* *<games-won>* *<user>* *<games-won>*",
      ["- Records a match between 2 players", "- Example: \`=record @vizi 3 @sack 1\`"]);

  msg.channel.send(embed);
};

const register = async (msg) => {
  if (validator.isCommand(msg)) {
    let playerId = msg.author.id;
    let playerName = msg.author.username;
    let playerAvatar = msg.author.avatarURL;
    let playerMember = msg.member;

    const result = validator.checkArgs(msg);
    if (result.errors) { msg.channel.send(result.errors); return; }
    if (result.numArgs > 0) {
      let errors = validator.checkMod(msg);
      if (errors) { msg.channel.send(errors); return; }
      playerId = msg.mentions.users.first().id;
      playerName = msg.mentions.users.first().username;
      playerAvatar = msg.mentions.users.first().avatarURL;
      playerMember = msg.mentions.members.first();
    }

    const memberErrors = validator.checkMember(playerMember);
    if (memberErrors) { msg.channel.send(memberErrors); return; }

    const embed = new Discord.RichEmbed();

    try {
      const existingPlayer = await Player.find({ discordId: playerId }).limit(1);

      if (existingPlayer.length) {
        embed.setColor("GREEN");
        embed.setDescription("Already registered");
        msg.channel.send(embed);
        return;
      }

      await new Player({
        discordId: playerId,
        discordName: playerName,
        discordAvatar: playerAvatar
      }).save();

      embed.setColor("GREEN");
      embed.setDescription(`**Success**, registered ${playerName}`);
      msg.channel.send(embed);

    } catch {
      embed.setColor("RED");
      embed.setDescription("Database error");
      msg.channel.send(embed);
    }
  }
};

const profile = async msg => {
  if (validator.isCommand(msg)) {
    let playerId = msg.author.id;

    const result = validator.checkArgs(msg);
    if (result.errors) { msg.channel.send(result.errors); return; }
    if (result.numArgs > 0) {
      errors = validator.checkMember(msg.mentions.members.first());
      if (errors) { msg.channel.send(errors); return; }
      playerId = msg.mentions.users.first().id;
    }

    const embed = new Discord.RichEmbed();

    try {
      const profile = await Player.findOne({ discordId: playerId }).lean();

      if (profile) {
        const days = Math.round((Date.now() - profile.lastMatch.getTime()) / (24 * 60 * 60 * 1000));
        let dayText = " ";
        if (days === 0) dayText = "Today";
        if (days === 1) dayText = "Yesterday";
        if (days > 1) dayText = `${days} days ago`;
        embed.setColor("LUMINOUS_VIVID_PINK");
        embed.setTitle(profile.discordName);
        embed.setThumbnail(profile.discordAvatar);
        embed.setDescription(`\`\`\`ELO:    ${profile.elo}\nWins:   ${profile.wins}\nLosses: ${profile.losses}\`\`\``);
        embed.setFooter(`Last match played: ${dayText}`);
        msg.channel.send(embed);
        return;
      }

      embed.setColor("BLUE");
      embed.setDescription("Profile not found");
      msg.channel.send(embed);

    } catch {
      embed.setColor("RED");
      embed.setDescription("Database error");
      msg.channel.send(embed);
    }
  }
};

const leaderboard = async (msg) => {
  const errors = validator.checkMod(msg);
  if (errors) { msg.channel.send(errors); return; }

  const embed = new Discord.RichEmbed();

  try {
    const players = await Player.find({}).select("elo discordName").sort({ elo: -1 }).lean();

    let board = "```";
    for (let index = 0; index < players.length; index++) {
      board += `#${index + 1} - ELO: ${players[index].elo} ${players[index].discordName}\n`;
    }
    board += "```";

    embed.setTitle("Big Dick Playas");
    embed.setColor("GOLD");
    embed.setDescription(board);
    msg.channel.send(embed);
  } catch {
    embed.setColor("RED");
    embed.setDescription("Database error");
    msg.channel.send(embed);
  }
};

const reset = async (msg) => {
  if (validator.isCommand(msg)) {
    const playerId = msg.mentions.users.first().id;
    const playerName = msg.mentions.users.first().username;
    const playerMember = msg.mentions.members.first();
    const result = validator.checkArgs(msg);
    if (result.errors) { msg.channel.send(result.errors); return; }
    if (result.numArgs === 0) {
      const missing = new Discord.RichEmbed()
        .setColor("RED")
        .setDescription("**Error**: You must mention a user with @");
      msg.channel.send(missing);
      return;
    }
    if (result.numArgs > 0) {
      const modErrors = validator.checkMod(msg);
      if (modErrors) { msg.channel.send(modErrors); return; }

      const memberErrors = validator.checkMember(playerMember);
      if (memberErrors) { msg.channel.send(memberErrors); return; }

      const embed = new Discord.RichEmbed();

      try {
        const result = await Player.updateOne({ discordId: playerId }, { $set: { elo: 1000, wins: 0, losses: 0 } });
        if (result.n == 1) {
          embed.setColor("GREEN");
          embed.setDescription(`**Success**, stats have been reset for ${playerName}`);
          msg.channel.send(embed);
          return;
        }
        embed.setColor("BLUE");
        embed.setDescription("Player not found");
        msg.channel.send(embed);
        return;
      } catch {
        embed.setColor("RED");
        embed.setDescription("Database error");
        msg.channel.send(embed);
      }
    }
  }
};

const resetboard = async (msg) => {
  const modErrors = validator.checkMod(msg);
  if (modErrors) { msg.channel.send(modErrors); return; }
  const embed = new Discord.RichEmbed();

  try {
    await Player.deleteMany({});
    embed.setColor("GREEN");
    embed.setDescription("**Success**, leaderboard has been reset");
    msg.channel.send(embed);
  } catch {
    embed.setColor("RED");
    embed.setDescription("Database error");
    msg.channel.send(embed);
  }
};

const decay = async (msg) => {
  const embed = new Discord.RichEmbed();
  return embed
};

const record = async (msg) => {
  const embed = new Discord.RichEmbed();
  return embed
};

module.exports = {
  help,
  register,
  profile,
  leaderboard,
  reset,
  resetboard,
  decay,
  record
};
