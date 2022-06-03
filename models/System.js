const mongoose = require('mongoose');
const { Schema } = mongoose;

const systemSchema = new Schema(
    {
        paramName: { type: String, unique: true },
        paramValue: String
    }
);

// eslint-disable-next-line no-undef
module.exports = System = mongoose.model('system', systemSchema);
