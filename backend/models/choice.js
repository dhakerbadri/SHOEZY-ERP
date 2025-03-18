const mongoose = require('mongoose');

const choiceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['product', 'service'], required: true },
});

const Choice = mongoose.model('Choice', choiceSchema);
module.exports = Choice;
