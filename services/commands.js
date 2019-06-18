const Discord = require("discord.js");
const Player = require("../models/Player");
const validMember = "Villains";
const validMod = "Super Villians";
const prefix = "=";

//message.member.roles.some((role) => role.name === "Lord");

const help = () => {
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

  return embed;
}

const register = async (msg) => {
  const msgArr = msg.content.split(" ");
  if (msgArr[0] === `${prefix}register`) {
    const embed = new Discord.RichEmbed();
    embed.setColor("RED");
    embed.setDescription("Too many arguments");

    if (msgArr.length === 2) {
      embed.setDescription("You must mention a user with @");
      if (msg.mentions.members.size === 1) {
        embed.setDescription("found 1 mentions");
      }
    }

    if (msgArr.length === 1) {
      if (msg.member.roles.some(role => role.name === validMember)) {
        embed.setColor("GREEN");
        embed.setDescription(`Success, registered as ${msg.author.username}`);
      } else {
        embed.setColor("RED");
        embed.setDescription("Failed, you are not a crew member");
      }
    }

    msg.channel.send(embed);
  }
}

const profile = async msg => {
  const embed = new Discord.RichEmbed();

  try {
    const profile = await Player.findOne({ discordId: discordid }).lean();
    if (profile) {
      embed.setColor("BLUE");
      embed.setDescription("profile found");
      return embed;
    }
    embed.setColor("RED");
    embed.setDescription("profile not found");
    return embed;
  } catch {
    embed.setColor("RED");
    embed.setDescription("error");
    return embed;
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
