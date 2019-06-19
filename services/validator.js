const Discord = require("discord.js");
const validMember = "Villains";
const validMod = "Super Villians";
const prefix = "=";

const isCommand = (msg) => {
  const msgArr = msg.content.split(" ");
  const cmds = [
    `${prefix}register`,
    `${prefix}profile`,
    `${prefix}reset`,
    `${prefix}record`
  ];
  return cmds.includes(msgArr[0]);
};

const checkArgs = (msg) => {
  const msgArr = msg.content.split(" ");
  const result = { errors: null, numArgs: 0 };

  if (msgArr.length - 1 === 0) return result;
  if (msgArr.length - 1 > 1) {
    result.errors = new Discord.RichEmbed();
    result.errors.setColor("RED");
    result.errors.setDescription("**Error**: Too many parameters");
    return result;
  }
  if (msg.mentions.members.size != 1) {
    result.errors = new Discord.RichEmbed();
    result.errors.setColor("RED");
    result.errors.setDescription("**Error**: You must mention a user with @");
    return result;
  }
  result.numArgs = 1;
  return result;
};

const checkRecordArgs = (msg) => {
  const msgArr = msg.content.split(" ");
  const errors = new Discord.RichEmbed();

  if (msgArr.length - 1 > 1) {
    errors.setColor("RED");
    errors.setDescription(`**Error**: expected **${numArgs}** parameter(s), received **${msgArr.length - 1}**`);
    return errors;
  }
  if (msg.mentions.members.size != numMentions) {
    errors.setColor("RED");
    errors.setDescription(`**Error**: expected **${numMentions}** mention(s), received **${msg.mentions.members.size}**`);
    return errors;
  } else {
    return null;
  }
  if (msg.mentions.members.size > numMentions) {
    errors.setColor("RED");
    errors.setDescription("**Error**: too many mentions");
    return errors;
  } else {
    return null;
  }
};

const checkMember = (member) => {
  const errors = new Discord.RichEmbed();

  if (member.roles.some((role) => role.name === validMember)) {
    return null;
  } else {
    errors.setColor("RED");
    errors.setDescription("**Failed**, not a crew member");
    return errors;
  }
};

const checkMod = (msg) => {
  const errors = new Discord.RichEmbed();

  if (msg.member.roles.some((role) => role.name === validMod)) {
    return null;
  } else {
    errors.setColor("RED");
    errors.setDescription("**Failed**, you are not a mod");
    return errors;
  }
};

module.exports = {
  isCommand,
  checkArgs,
  checkRecordArgs,
  checkMember,
  checkMod
};