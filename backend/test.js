const mongoose = require('mongoose');
const Client = require('./models/Client'); // Adjust the path as per your project structure
const Transaction = require('./models/Transaction');
const addTransaction = async (clientId, transactionData) => {
    try {
        const newTransaction = new Transaction({
            ...transactionData,
            id_client: clientId,
        });

        const savedTransaction = await newTransaction.save();

        await Client.findByIdAndUpdate(
            clientId,
            { $push: { transactions: savedTransaction._id } },
            { new: true }
        );

        console.log('Transaction added successfully:', savedTransaction);
    } catch (error) {
        console.error('Error adding transaction:', error);
    }
};

const runTest = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://localhost:27017/erp_shoezy', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Replace with an actual client ID from your database
        const clientId = '67925fa452c42eec589f0167'; // Replace with a valid client ID
        const transactionData = {
            date_purchase: new Date(),
            date_delivery: new Date(),
            payment_method: 'Cheque',
            amount: 230.0,
        };

        await addTransaction(clientId, transactionData);
        console.log('Test completed');
    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        mongoose.connection.close();
    }
};

runTest();
