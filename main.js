const Discord = require("discord.js");
const mongoose = require("mongoose");
const config = require("./config/config");
const commands = require("./services/commands");
const client = new Discord.Client();
const prefix = "=";

// Connect to Discord
client.once("ready", () => {
  console.log("Connected as " + client.user.tag);
  client.user.setPresence({ game: { name: "type =help" } });
});

// Connect to MongoDB Atlas
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useCreateIndex: true }).then(
  () => {
    console.log("MongoDB connected...\n");
  },
  err => {
    console.log("MongoDB could not connect...\n" + err);
  }
);

client.on("userUpdate", (oldUser, newUser) => {
  console.log("old: ");
  console.log(oldUser);
  console.log("new: ");
  console.log(newUser);
});

client.on("message", async message => {
  if (message.content === `${prefix}leaderboard`) {
    const embed = await commands.leaderboard();
    message.channel.send(embed);
  }

  if (message.content.startsWith(`${prefix}profile`)) {
    const embed = await commands.profile(message);
    message.channel.send(embed);
  }

  if (message.channel.name === "leaderboard") {

    if (message.content === `${prefix}help`) {
      const embed = commands.help();
      message.channel.send(embed);
    }

    if (message.content.startsWith(`${prefix}register`)) {
      await commands.register(message);
    }

    if (message.content.startsWith(`${prefix}record`)) {
      const embed = await commands.record(message);
      message.channel.send(embed);
    }

    if (message.content.startsWith(`${prefix}reset`)) {
      const embed = await commands.reset(message);
      message.channel.send(embed);
    }

    if (message.content === `${prefix}resetboard`) {
      const embed = await commands.resetboard(message);
      message.channel.send(embed);
    }
  }
});

client.login(config.token);
