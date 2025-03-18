const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Choice = require('./models/choice');
const Pack = require('./models/pack');

dotenv.config();
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const seedData = async () => {
    try {
        // Clear previous data
        await Choice.deleteMany();
        await Pack.deleteMany();

        // Seed choices (products and services)
        const choices = await Choice.insertMany([
            { name: 'Shoe protectors', type: 'product' },
            { name: 'Nike dyed socks', type: 'product' },
            { name: 'Nike socks', type: 'product' },
            { name: 'Custom sneaker', type: 'product' },
            { name: 'Sneakers', type: 'product' },
            { name: 'Off-white laces', type: 'product' },
            { name: 'Custom jackets', type: 'product' },
            { name: 'Customization', type: 'service' },
            { name: 'Renovation', type: 'service' },
            { name: 'Protection', type: 'service' },
        ]);

        // Seed packs for services
        const packs = [ 
            { name: 'Basic Customization Pack', service: choices.find(c => c.name === 'Customization')._id },
            { name: 'Premium Renovation Pack', service: choices.find(c => c.name === 'Renovation')._id },
            { name: 'Protection Starter Pack', service: choices.find(c => c.name === 'Protection')._id },
        ];
        await Pack.insertMany(packs);

        console.log('Database seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
