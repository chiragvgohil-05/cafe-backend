import menuCategoryModel from '../../Models/MenuCategoryModel.js';
import uploadToCloudinary from '../../utils/uploadToCloudinary.js';
import menuItemModel from '../../Models/MenuItemModel.js';

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
            name: name.trim(),
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category already exists',
            });
        }

        const category = await menuCategoryModel.create({
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
        const { isActive } = req.query;
        const filter = {};

        if (isActive !== undefined) {
            filter.isActive = isActive === 'true';
        }

        const categories = await menuCategoryModel.find(filter).sort({ createdAt: -1 });

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

        // 🖼 Image upload
        let imageUrl = null;
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'menuItems');
            imageUrl = result.secure_url;
        }

        // 🍽 Create menu item
        const menuItem = await menuItemModel.create({
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
        // 📋 Get menu with categories + items
        const menu = await menuCategoryModel.aggregate([
            {
                $match: {
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

const updateMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const { categoryId, name, description, price, isAvailable } = req.body;

        const updateData = {
            categoryId,
            name,
            description,
            price,
            isAvailable
        };

        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer, 'menuItems');
            updateData.image = result.secure_url;
        }

        const menuItem = await menuItemModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Menu item updated successfully',
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

const deleteMenu = async (req, res) => {
    try {
        const { id } = req.params;
        const menuItem = await menuItemModel.findByIdAndDelete(id);

        if (!menuItem) {
            return res.status(404).json({
                success: false,
                message: 'Menu item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Menu item deleted successfully'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, isActive } = req.body;

        const category = await menuCategoryModel.findByIdAndUpdate(
            id,
            { name, isActive },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if there are menu items in this category
        const itemsCount = await menuItemModel.countDocuments({ categoryId: id });
        if (itemsCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete category with associated menu items. Delete the items first.',
            });
        }

        const category = await menuCategoryModel.findByIdAndDelete(id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found',
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully',
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

export default {
    create,
    list,
    createMenu,
    menuList,
    updateMenu,
    deleteMenu,
    updateCategory,
    deleteCategory
};