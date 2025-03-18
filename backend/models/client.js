const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone_number: { type: String, required: true },
    size: { type: Number }, // Optional field
    favorite_brand: { type: String }, // Optional field
    favorite_color: { type: String }, // Optional field
    transactions: [
        { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' }, // Links transactions to this client
    ],
});

// Use an existing model if it exists; otherwise, create a new one
const Client = mongoose.models.Client || mongoose.model('Client', ClientSchema);

module.exports = Client;
