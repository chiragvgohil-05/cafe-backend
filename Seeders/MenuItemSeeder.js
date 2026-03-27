import 'dotenv/config';
import connectDatabase from '../Database/db.js';
import MenuItem from '../Models/MenuItemModel.js';

const products = [
  {
    "name": "Espresso",
    "description": "Strong and rich single shot coffee.",
    "price": 100,
    "categoryId": "69c2b6c0d6cfe85605a68392",
    "image": "/public/uploads/products/espresso.png",
    "isAvailable": true
  },
  {
    "name": "Cappuccino",
    "description": "Creamy coffee with milk foam.",
    "price": 150,
    "categoryId": "69c2b6c0d6cfe85605a68392",
    "image": "/public/uploads/products/cappuccino.png",
    "isAvailable": true
  },
  {
    "name": "Latte",
    "description": "Smooth coffee with milk.",
    "price": 170,
    "categoryId": "69c2b6c0d6cfe85605a68392",
    "image": "/public/uploads/products/latte.png",
    "isAvailable": true
  },
  {
    "name": "Masala Tea",
    "description": "Indian spiced tea.",
    "price": 60,
    "categoryId": "69c2b6c0d6cfe85605a68393",
    "image": "/public/uploads/products/masala-tea.png",
    "isAvailable": true
  },
  {
    "name": "Green Tea",
    "description": "Healthy antioxidant tea.",
    "price": 80,
    "categoryId": "69c2b6c0d6cfe85605a68393",
    "image": "/public/uploads/products/green-tea.png",
    "isAvailable": true
  },
  {
    "name": "Cold Coffee",
    "description": "Chilled coffee with ice cream.",
    "price": 190,
    "categoryId": "69c2b6c0d6cfe85605a68394",
    "image": "/public/uploads/products/cold-coffee.png",
    "isAvailable": true
  },
  {
    "name": "Iced Tea",
    "description": "Refreshing chilled tea.",
    "price": 120,
    "categoryId": "69c2b6c0d6cfe85605a68394",
    "image": "/public/uploads/products/iced-tea.png",
    "isAvailable": true
  },
  {
    "name": "Chocolate Milkshake",
    "description": "Thick chocolate shake.",
    "price": 220,
    "categoryId": "69c2b6c0d6cfe85605a68395",
    "image": "/public/uploads/products/choco-shake.png",
    "isAvailable": true
  },
  {
    "name": "Strawberry Smoothie",
    "description": "Fresh strawberry smoothie.",
    "price": 210,
    "categoryId": "69c2b6c0d6cfe85605a68395",
    "image": "/public/uploads/products/strawberry-smoothie.png",
    "isAvailable": true
  },
  {
    "name": "Croissant",
    "description": "Buttery flaky pastry.",
    "price": 100,
    "categoryId": "69c2b6c0d6cfe85605a68396",
    "image": "/public/uploads/products/croissant.png",
    "isAvailable": true
  },
  {
    "name": "Blueberry Muffin",
    "description": "Soft muffin with blueberries.",
    "price": 130,
    "categoryId": "69c2b6c0d6cfe85605a68396",
    "image": "/public/uploads/products/muffin.png",
    "isAvailable": true
  },
  {
    "name": "Chocolate Brownie",
    "description": "Rich chocolate brownie.",
    "price": 150,
    "categoryId": "69c2b6c0d6cfe85605a68397",
    "image": "/public/uploads/products/brownie.png",
    "isAvailable": true
  },
  {
    "name": "Cheesecake",
    "description": "Creamy cheesecake dessert.",
    "price": 260,
    "categoryId": "69c2b6c0d6cfe85605a68397",
    "image": "/public/uploads/products/cheesecake.png",
    "isAvailable": true
  },
  {
    "name": "French Fries",
    "description": "Crispy salted fries.",
    "price": 100,
    "categoryId": "69c2b6c0d6cfe85605a68398",
    "image": "/public/uploads/products/fries.png",
    "isAvailable": true
  },
  {
    "name": "Garlic Bread",
    "description": "Toasted garlic bread.",
    "price": 120,
    "categoryId": "69c2b6c0d6cfe85605a68398",
    "image": "/public/uploads/products/garlic-bread.png",
    "isAvailable": true
  },
  {
    "name": "Veg Burger",
    "description": "Delicious veg burger.",
    "price": 150,
    "categoryId": "69c2b6c0d6cfe85605a68399",
    "image": "/public/uploads/products/veg-burger.png",
    "isAvailable": true
  },
  {
    "name": "Paneer Burger",
    "description": "Burger with paneer patty.",
    "price": 190,
    "categoryId": "69c2b6c0d6cfe85605a68399",
    "image": "/public/uploads/products/paneer-burger.png",
    "isAvailable": true
  },
  {
    "name": "Grilled Sandwich",
    "description": "Grilled veg sandwich.",
    "price": 140,
    "categoryId": "69c2b6c0d6cfe85605a68399",
    "image": "/public/uploads/products/sandwich.png",
    "isAvailable": true
  },
  {
    "name": "Mocha Coffee",
    "description": "Coffee with chocolate flavor.",
    "price": 180,
    "categoryId": "69c2b6c0d6cfe85605a68392",
    "image": "/public/uploads/products/mocha.png",
    "isAvailable": true
  },
  {
    "name": "Black Coffee",
    "description": "Pure black coffee.",
    "price": 80,
    "categoryId": "69c2b6c0d6cfe85605a68392",
    "image": "/public/uploads/products/black-coffee.png",
    "isAvailable": true
  }
];

const seedProducts = async () => {
  try {
    await connectDatabase();

    // Clear existing products
    await MenuItem.deleteMany({});
    console.log('🗑️  Existing products deleted');

    // Insert new products
    const createdProducts = await MenuItem.insertMany(products);
    console.log(`✅ ${createdProducts.length} products seeded successfully!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error.message);
    process.exit(1);
  }
};

seedProducts();
