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
}

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
      embed.setDescription("Database connection failed");
      msg.channel.send(embed);
    }
  }
}

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
      embed.setDescription("Database connection failed");
      msg.channel.send(embed);
    }
  }
};

const leaderboard = async () => {
  const arr = ["A | MB | FoFo", "matt", "alex"];
  let board = "```";

  for (let index = 0; index < arr.length; index++) {
    board += `#${index + 1} - ELO: 1000 ${arr[index]}\n`;
  }
  board += "```";

  const embed = new Discord.RichEmbed()
    .setTitle("Big Dick Playas")
    .setColor("GOLD")
    .setDescription(board);

  return embed;
}

const reset = async (msg) => {
  const embed = new Discord.RichEmbed();
  return embed
}

const resetboard = async (msg) => {
  const embed = new Discord.RichEmbed();
  return embed
}

const decay = async (msg) => {
  const embed = new Discord.RichEmbed();
  return embed
}

const record = async (msg) => {
  const embed = new Discord.RichEmbed();
  return embed
}

const changeHandle = async (id, handle) => {
  try {
    const result = await User.updateOne({ _id: id }, { $set: { handle: handle, hasProfile: true } });
    if (result.n == 1) {
      return null;
    } else {
      return { error: "ID not found" };
    }
  } catch {
    return { error: "Database update failed" };
  }
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
