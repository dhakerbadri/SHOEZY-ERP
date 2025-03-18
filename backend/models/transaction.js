const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    id_client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },
    date_purchase: {
        type: Date,
        required: true,
        default: Date.now, // Default to current date if not provided
    },
    date_delivery: {
        type: Date,
    },
    payment_method: {
        type: String,
        enum: ['Cash', 'Card', 'Cheque'], // Expandable if needed
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    transaction_details: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TransactionDetails',
        },
    ], // Array to reference associated transaction details
});

module.exports = mongoose.model('Transaction', TransactionSchema);
