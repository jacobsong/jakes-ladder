const Discord = require("discord.js");
const { prefix, token } = require("./config.json");
const client = new Discord.Client();

client.once("ready", () => {
  console.log("Connected as " + client.user.tag);
});

client.on("message", message => {
  if (message.content.startsWith(`${prefix}help`)) {
    const embed = new Discord.RichEmbed()
      .setColor([0, 200, 0])
      .setTitle("Help Menu")
      .setFooter("This is a footer")
      .setDescription("description")
      .addField("field");

    message.channel.send(embed);
  }
});

client.login(token);
