const mongoose = require('mongoose');

const TransactionDetailsSchema = new mongoose.Schema({
    id_transaction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required: true,
    },
    choiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Choice', // Reference to the Choice model
        required: true,
    },
    purchase_type: {
        type: String,
        enum: ['product', 'service'],
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
    },
    price_per_unit: {
        type: Number,
        required: true,
    },
    total_price: {
        type: Number,
        required: true,
    },
    purchase_detail: {
        type: String,
        default: '',
    },
});

module.exports = mongoose.model('TransactionDetails', TransactionDetailsSchema);
