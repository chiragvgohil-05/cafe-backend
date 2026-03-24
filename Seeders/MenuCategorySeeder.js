import 'dotenv/config';
import mongoose from 'mongoose';
import connectDatabase from '../Database/db.js';
import MenuCategory from '../Models/MenuCategoryModel.js';

const categories = [
    { name: "Coffee", isActive: true },
    { name: "Tea", isActive: true },
    { name: "Cold Beverages", isActive: true },
    { name: "Milkshakes & Smoothies", isActive: true },
    { name: "Bakery Items", isActive: true },
    { name: "Desserts", isActive: true },
    { name: "Fast Food / Snacks", isActive: true },
    { name: "Sandwiches & Burgers", isActive: true }
];

const seedCategories = async () => {
    try {
        await connectDatabase();

        // Clear existing categories
        await MenuCategory.deleteMany({});
        console.log('🗑️  Existing categories deleted');

        // Insert new categories
        const createdCategories = await MenuCategory.insertMany(categories);
        console.log(`✅ ${createdCategories.length} categories seeded successfully!`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding categories:', error.message);
        process.exit(1);
    }
};

seedCategories();
