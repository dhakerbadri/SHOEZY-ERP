const express = require('express');
const router = express.Router();
const Transaction = require('../models/transaction');
const Client = require('../models/Client');

// Add a new transaction
router.post('/add', async (req, res) => {
    const { clientId, transactionData, transactionDetails } = req.body;

    try {
        // Create the transaction
        const newTransaction = new Transaction({
            ...transactionData,
            id_client: clientId,
        });

        // Save the transaction
        const savedTransaction = await newTransaction.save();

        // Update the client's transactions array (if the field exists in the Client schema)
        await Client.findByIdAndUpdate(
            clientId,
            { $push: { transactions: savedTransaction._id } }, // Ensure "transactions" exists in Client schema
            { new: true }
        );

        res.status(201).json({
            message: 'Transaction added successfully',
            savedTransaction,
        });
    } catch (error) {
        console.error('Error adding transaction:', error.message);
        res.status(500).json({
            message: 'Failed to add transaction',
            error: error.message,
        });     
    }
});

// Fetch all transactions for a client
const mongoose = require('mongoose');

router.get('/client/:clientId', async (req, res) => {
    const { clientId } = req.params;

    // Validate clientId
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
        return res.status(400).json({ message: 'Invalid clientId' });
    }

    try {
        const transactions = await Transaction.find({ id_client: clientId })
            .populate({
                        path :'transaction_details',
                        populate : {
                        path:'choiceId',
                        select: 'name',
                        },
                    });

    

        res.status(200).json(transactions || []);
    } catch (error) {
        console.error('Error fetching transactions:', error.message);
        res.status(500).json({
            message: 'Failed to fetch transactions',
            error: error.message,
        });
    }
});

// Fetch a single transaction by ID with details
router.get('/:transactionId', async (req, res) => {
    const { transactionId } = req.params;

    try {
        const transaction = await Transaction.findById(transactionId).populate('transaction_details');
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(200).json(transaction);
    } catch (error) {
        console.error('Error fetching transaction:', error.message);
        res.status(500).json({
            message: 'Failed to fetch transaction',
            error: error.message,
        });
    }
});

module.exports = router;
