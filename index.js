const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Intents } = require('discord.js');
const mongoose = require('mongoose');
const Player = require('./models/Player');
const config = require('./config/config');
const validator = require('./utils/validator');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS] });
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
client.commands = new Collection();

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.data.name, command);
}

// Verify connected and set presence
client.once('ready', () => {
    console.log('Logged in as ' + client.user.tag);
});

// Connect to MongoDB Atlas
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true }).then(
    () => {
        console.log('MongoDB connected...');
    },
    err => {
        console.error(err);
        console.log('MongoDB could not connect...');
    }
);

// Update DB when users change usernames
client.on('userUpdate', async (oldUser, newUser) => {
    try {
        await Player.updateOne({ discordId: oldUser.id },
            { $set: { discordName: newUser.username } }
        );
    }
    catch (e) {
        console.error(e);
        console.log('Error updating user\'s discordName or avatar');
    }
});

// Update DB when members leave
client.on('guildMemberRemove', async member => {
    try {
        await Player.deleteOne({ discordId: member.id });
    }
    catch (e) {
        console.error(e);
        console.log('Error deleting guild member');
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) return;
    if (!validator.hasPermissions(interaction, command)) return;

    try {
        await command.execute(interaction);
    }
    catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// Login with bot token
try {
    client.login(config.token);
}
catch (e) {
    console.error(e);
    console.log('Failed to login to Discord');
}
