const express = require('express');
const router = express.Router();
const { Transaction, TransactionDetails, Client } = require('../models');

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
// DELETE a transaction and its details
router.delete('/:transactionId', async (req, res) => {
    try {
        // Validate transaction ID
        if (!mongoose.Types.ObjectId.isValid(req.params.transactionId)) {
            return res.status(400).json({ message: 'Invalid transaction ID' });
        }

        // Delete transaction details first
        await TransactionDetails.deleteMany({ id_transaction: req.params.transactionId });

        // Then delete the transaction
        const deletedTransaction = await Transaction.findByIdAndDelete(req.params.transactionId);

        if (!deletedTransaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json({
            message: 'Transaction deleted successfully',
            deletedTransaction
        });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({
            message: 'Failed to delete transaction',
            error: error.message
        });
    }
});

// UPDATE a transaction
router.put('/:transactionId', async (req, res) => {
    try {
        const { transactionData, detailsArray } = req.body;

        // Validate input
        if (!transactionData || !detailsArray) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Calculate new amount
        const newAmount = detailsArray.reduce((sum, detail) => {
            return sum + (detail.quantity * detail.price_per_unit);
        }, 0);

        // Update transaction
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            req.params.transactionId,
            {
                ...transactionData,
                amount: newAmount
            },
            { new: true }
        );

        // Process details
        const updatedDetails = await Promise.all(
            detailsArray.map(async (detail) => {
                if (detail._id) {
                    // Update existing detail
                    return await TransactionDetails.findByIdAndUpdate(
                        detail._id,
                        {
                            quantity: detail.quantity,
                            price_per_unit: detail.price_per_unit,
                            total_price: detail.quantity * detail.price_per_unit
                        },
                        { new: true }
                    );
                } else {
                    // Create new detail
                    const newDetail = new TransactionDetails({
                        ...detail,
                        id_transaction: req.params.transactionId,
                        total_price: detail.quantity * detail.price_per_unit
                    });
                    return await newDetail.save();
                }
            })
        );

        // Remove any details not included in the update
        await TransactionDetails.deleteMany({
            id_transaction: req.params.transactionId,
            _id: { $nin: updatedDetails.map(d => d._id) }
        });

        res.status(200).json({
            message: 'Transaction updated successfully',
            transaction: updatedTransaction,
            details: updatedDetails
        });

    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({
            message: 'Failed to update transaction',
            error: error.message
        });
    }
});

module.exports = router;
