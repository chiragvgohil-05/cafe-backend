import cafeModel from '../../Models/CafeModel.js';
import menuCategoryModel from '../../Models/MenuCategoryModel.js';
import uploadToCloudinary from '../../utils/uploadToCloudinary.js';
import menuItemModel from '../../Models/MenuItemModel.js';
import mongoose from 'mongoose';
import { DEFAULT_CAFE_ID } from '../../Config/cafe.config.js';

const create = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required',
            });
        }

        const existingCategory = await menuCategoryModel.findOne({
            cafeId: DEFAULT_CAFE_ID,
            name: name.trim(),
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists',
            });
        }

        const category = await menuCategoryModel.create({
            cafeId: DEFAULT_CAFE_ID,
            name: name.trim(),
        });

        res.status(200).json({
            success: true,
            message: 'Menu category created successfully',
            data: category,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};


const list = async (req, res) => {
    try {
        const categories = await menuCategoryModel.find({
            cafeId: DEFAULT_CAFE_ID
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: categories,
            message: 'Category list successfully',
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

// for menu crud
const createMenu = async (req, res) => {
    try {
        const { categoryId, name, description, price, isAvailable } = req.body;

        if (!categoryId || !name || !price) {
            return res.status(400).json({
                success: false,
                message: 'categoryId, name and price are required',
            });
        }

        // 🔐 Logged-in user
        const ownerId = req.user.id;

        // ☕ Find cafe of this owner
        const cafe = await cafeModel.findOne({ isOwner: ownerId });
        if (!cafe) {
            return res.status(400).json({
                success: false,
                message: 'Cafe not found'
            });
        }

        // 🖼 Image upload
        let imageUrl = null;
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'menuItems');
            imageUrl = result.secure_url;
        }

        // 🍽 Create menu item
        const menuItem = await menuItemModel.create({
            cafeId: cafe._id,     // 🔥 auto from backend
            categoryId,
            name,
            description,
            price,
            isAvailable: isAvailable ?? true,
            image: imageUrl,
        });

        res.status(201).json({
            success: true,
            message: 'Menu item created successfully',
            data: menuItem,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};


const menuList = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const cafe = await cafeModel.findOne({ isOwner: ownerId });

        if (!cafe) {
            return res.status(400).json({
                success: false,
                message: 'Cafe not found for this user',
            });
        }

        // 📋 Get menu with categories + items
        const menu = await menuCategoryModel.aggregate([
            {
                $match: {
                    cafeId: new mongoose.Types.ObjectId(cafe._id),
                    isActive: true
                }
            },
            {
                $lookup: {
                    from: 'menuitems',
                    localField: '_id',
                    foreignField: 'categoryId',
                    as: 'items',
                }
            },
            {
                $project: {
                    name: 1,
                    items: {
                        _id: 1,
                        name: 1,
                        description: 1,
                        price: 1,
                        image: 1,
                        isAvailable: 1
                    }
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ]);

        return res.status(200).json({
            success: true,
            message: 'Menu list fetched successfully',
            data: menu,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};



export default {
    create,
    list,
    createMenu,
    menuList
};