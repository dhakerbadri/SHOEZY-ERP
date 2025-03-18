const mongoose = require('mongoose');

const packSchema = new mongoose.Schema({
    name: { type: String, required: true },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Choice', required: true },
});

const Pack = mongoose.model('Pack', packSchema);
module.exports = Pack;
