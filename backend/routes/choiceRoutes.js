const express = require('express');
const router = express.Router();
const Choice = require('../models/choice');

// Get all choices
router.get('/', async (req, res) => {
    try {
        const choices = await Choice.find();
        res.status(200).json(choices);
    } catch (error) {
        console.error('Error fetching choices:', error);
        res.status(500).json({ message: 'Failed to fetch choices', error });
    }
});

// Get all choices by type (product or service)
router.get('/:type', async (req, res) => {
    const { type } = req.params;

    try {
        const choices = await Choice.find({ type });
        res.status(200).json(choices);
    } catch (error) {
        console.error('Error fetching choices:', error);
        res.status(500).json({ message: 'Failed to fetch choices', error });
    }
});

// Add a new choice
router.post('/', async (req, res) => {
    const { name, type } = req.body;

    try {
        const newChoice = new Choice({ name, type });
        await newChoice.save();
        res.status(201).json(newChoice);
    } catch (error) {
        console.error('Error adding choice:', error);
        res.status(500).json({ message: 'Failed to add choice', error });
    }
});

// Update a choice
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, type } = req.body;

    try {
        const updatedChoice = await Choice.findByIdAndUpdate(
            id,
            { name, type },
            { new: true }
        );
        res.status(200).json(updatedChoice);
    } catch (error) {
        console.error('Error updating choice:', error);
        res.status(500).json({ message: 'Failed to update choice', error });
    }
});

// Delete a choice
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await Choice.findByIdAndDelete(id);
        res.status(200).json({ message: 'Choice deleted successfully' });
    } catch (error) {
        console.error('Error deleting choice:', error);
        res.status(500).json({ message: 'Failed to delete choice', error });
    }
});

module.exports = router;