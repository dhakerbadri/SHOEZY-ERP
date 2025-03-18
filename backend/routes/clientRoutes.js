const express = require('express');
const router = express.Router();
const Client = require('../models/Client');

// Get all clients (with transactions populated)
router.get('/', async (req, res) => {
    try {
        const clients = await Client.find().populate('transactions');
        res.status(200).json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Failed to fetch clients', error });
    }
});

// Get a single client by ID (with transactions populated)
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const client = await Client.findById(id).populate('transactions');
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json(client);
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ message: 'Failed to fetch client', error });
    }
});

// Add a new client
router.post('/', async (req, res) => {
    try {
        const client = new Client(req.body);
        const savedClient = await client.save();
        res.status(201).json({
            message: 'Client added successfully',
            client: savedClient,
        });
    } catch (error) {
        console.error('Error adding client:', error);
        res.status(500).json({ message: 'Failed to add client', error });
    }
});

// Update a client by ID
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const updatedClient = await Client.findByIdAndUpdate(id, req.body, {
            new: true, // Return the updated document
            runValidators: true, // Validate the updated data
        });
        if (!updatedClient) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json({
            message: 'Client updated successfully',
            client: updatedClient,
        });
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ message: 'Failed to update client', error });
    }
});

// Delete a client by ID
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedClient = await Client.findByIdAndDelete(id);
        if (!deletedClient) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.status(200).json({
            message: 'Client deleted successfully',
            client: deletedClient,
        });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ message: 'Failed to delete client', error });
    }
});

module.exports = router;
