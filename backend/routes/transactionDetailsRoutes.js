const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const { Transaction, TransactionDetails, Choice } = require('../models');
// Add a transaction with details
router.post('/addWithDetails', async (req, res) => {
    const { clientId, transactionData, detailsArray } = req.body;
    
    console.log('Received request:', { clientId, transactionData, detailsArray });

    try {
        // Validate required fields
        if (!clientId || !transactionData || !detailsArray) {
            return res.status(400).json({ message: 'Missing required fields: clientId, transactionData, or detailsArray' });
        }

        // Validate clientId format
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ message: 'Invalid clientId format' });
        }

        // Calculate the total amount
        const totalAmount = detailsArray.reduce((sum, detail) => {
            return sum + (detail.quantity * detail.price_per_unit);
        }, 0);

        // Create and save the transaction
        const transaction = new Transaction({
            date_purchase: transactionData.date_purchase,
            payment_method: transactionData.payment_method,
            amount: totalAmount,
            id_client: clientId,
        });

        const savedTransaction = await transaction.save();

        // Process transaction details
        const transactionDetails = await Promise.all(
            detailsArray.map(async (detail) => {
                // Validate choice exists
                const choice = await Choice.findById(detail.choiceId);
                if (!choice) {
                    throw new Error(`Choice with ID ${detail.choiceId} not found`);
                }

                // Validate purchase type matches choice type
                if (choice.type.toLowerCase() !== detail.purchase_type.toLowerCase()) {
                    throw new Error(`Purchase type (${detail.purchase_type}) doesn't match choice type (${choice.type})`);
                }

                // Create and save transaction detail
                const newDetail = new TransactionDetails({
                    choiceId: choice._id,
                    purchase_type: detail.purchase_type,
                    quantity: detail.quantity,
                    price_per_unit: detail.price_per_unit,
                    total_price: detail.quantity * detail.price_per_unit,
                    id_transaction: savedTransaction._id
                });

                return await newDetail.save();
            })
        );

        // Update transaction with details references
        savedTransaction.transaction_details = transactionDetails.map(d => d._id);
        await savedTransaction.save();

        res.status(201).json({
            message: 'Transaction and details added successfully',
            transaction: savedTransaction,
            details: transactionDetails
        });

    } catch (error) {
        console.error('Transaction error:', error.message);
        res.status(500).json({ 
            message: 'Failed to process transaction',
            error: error.message 
        });
    }
});

module.exports = router;