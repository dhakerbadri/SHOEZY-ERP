const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');
const TransactionDetails = require('../models/TransactionDetails');
const Choice = require('../models/choice'); // Import the Choice model

// Add a transaction with details
router.post('/addWithDetails', async (req, res) => {
    const { clientId, transactionData, detailsArray } = req.body;

    console.log('Received request:', { clientId, transactionData, detailsArray }); // Log the request

    try {
        // Validate clientId
        if (!mongoose.Types.ObjectId.isValid(clientId)) {
            return res.status(400).json({ message: 'Invalid clientId' });
        }

        // Calculate the total amount from transaction details
        const totalAmount = detailsArray.reduce((sum, detail) => {
            return sum + (detail.quantity * detail.price_per_unit);
        }, 0);

        // Create a new transaction with the calculated amount
        const transaction = new Transaction({
            ...transactionData,
            amount: totalAmount, // Set the calculated amount
            id_client: clientId,
        });

        // Save the transaction
        const savedTransaction = await transaction.save();

        // Add transaction details with reference to Choice
        const transactionDetails = await Promise.all(
            detailsArray.map(async (detail) => {
                // Validate choiceId
                const choice = await Choice.findById(detail.choiceId);
                if (!choice) {
                    throw new Error(`Choice with ID ${detail.choiceId} does not exist`);
                }

                // Validate purchase_type
                if (!detail.purchase_type) {
                    throw new Error('purchase_type is required for all transaction details');
                }

                // Ensure purchase_type matches the Choice type
                if (choice.type.toLowerCase() !== detail.purchase_type.toLowerCase()) {
                    throw new Error(
                        `Mismatch between purchase_type (${detail.purchase_type}) and choice type (${choice.type})`
                    );
                }

                // Calculate total_price
                const total_price = detail.quantity * detail.price_per_unit;

                // Create the transaction detail
                const newDetail = new TransactionDetails({
                    ...detail,
                    total_price, // Add calculated total_price
                    id_transaction: savedTransaction._id,
                    choiceId: choice._id, // Reference to the Choice
                });

                // Save the transaction detail
                const savedDetail = await newDetail.save();
                return savedDetail._id;
            })
        );

        // Link transaction details to the transaction
        savedTransaction.transaction_details = transactionDetails;
        await savedTransaction.save();

        // Return success response
        res.status(201).json({
            message: 'Transaction and details added successfully',
            savedTransaction,
        });
    } catch (error) {
        console.error('Error adding transaction with details:', error.message, error.stack);
        res.status(500).json({ message: 'Failed to add transaction with details', error: error.message });
    }
});

module.exports = router; // Export the router