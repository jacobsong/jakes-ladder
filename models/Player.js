const mongoose = require("mongoose");
const { Schema } = mongoose;

const playerSchema = new Schema(
  {
    discordId: String,
    discordName: String,
    discordAvatar: String,
    lastMatch: { type: Date, default: Date.now },
    registerDate: { type: Date, default: Date.now },
    elo: { type: Number, default: 1000 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 }
  }
);

module.exports = User = mongoose.model("players", playerSchema);
