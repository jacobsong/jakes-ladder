const Discord = require("discord.js");
const mongoose = require("mongoose");
const config = require("./config/config");
const commands = require("./services/commands");
const client = new Discord.Client();
const prefix = "=";

// Verify connected and set presence
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

// Update usernames in DB when users change usernames
// TODO check if member leaves
client.on("userUpdate", async (oldUser, newUser) => {
  console.log("old: ");
  await console.log(oldUser);
  console.log("new: ");
  console.log(newUser);
});

client.on("message", async message => {
  if (message.content.startsWith(`${prefix}register`)) {
    await commands.register(message);
  }

  if (message.content.startsWith(`${prefix}profile`)) {
    await commands.profile(message);
  }

  if (message.channel.name === "leaderboard") {

    if (message.content === `${prefix}help`) {
      commands.help(message);
    }

    if (message.content === `${prefix}leaderboard`) {
      await commands.leaderboard(message);
    }

    if (message.content.startsWith(`${prefix}reset`)) {
      await commands.reset(message);
    }

    if (message.content === `${prefix}resetboard`) {
      await commands.resetboard(message);
    }

    if (message.content === `${prefix}decay`) {
      await commands.decay(message);
    }

    if (message.content.startsWith(`${prefix}record`)) {
      await commands.record(message);
    }
  }
});

client.login(config.token);
