const validMod = 'Super Villains';
const validStaff = 'Staff';

const hasPermissions = (interaction, command) => {
    if (command.adminRequired) {
        if (interaction.member.roles.cache.some((role) => (role.name === validMod) || (role.name === validStaff))) {
            return true;
        }
        else {
            interaction.reply({ content: `You do not have the ${validMod} or ${validStaff} role`, ephemeral: true });
            return false;
        }
    }
    else {
        return true;
    }
};

const isValidRecord = (interaction, winner, loser) => {
    if (winner.id === loser.id) {
        interaction.reply({ content: 'Winner and Loser cannot be the same person', ephemeral: true });
        return false;
    }

    return true;
};

module.exports = {
    hasPermissions,
    isValidRecord
};