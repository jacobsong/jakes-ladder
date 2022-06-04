const validMod = 'Super Villains';
const validStaff = 'Staff';

const hasPermissions = (interaction, command) => {
    if (command.adminRequired) {
        if (interaction.member.roles.cache.some((role) => (role.name === validMod) || (role.name === validStaff))) {
            return true;
        }
        else {
            interaction.reply('You are not a mod');
            return false;
        }
    }
    else {
        return true;
    }
};

module.exports = {
    hasPermissions
};