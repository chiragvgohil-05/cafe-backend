import Order from '../../Models/OrderModel.js';
import MenuItem from '../../Models/MenuItemModel.js';
import Table from '../../Models/TableModel.js';
import orderModel from '../../Models/OrderModel.js';
import mongoose from 'mongoose';

const createOrder = async (req, res) => {
    try {
        const { tableId, reservationId, items } = req.body;
        const userId = req.user ? req.user.id : null;

        if (!tableId || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'tableId and items are required'
            });
        }

        if (!mongoose.Types.ObjectId.isValid(tableId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tableId'
            });
        }

        const table = await Table.findById(tableId);
        if (!table || !table.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Invalid tableId'
            });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            if (!item?.itemId || !mongoose.Types.ObjectId.isValid(item.itemId)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid menu item id'
                });
            }

            if (!item?.quantity || Number(item.quantity) <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Item quantity must be greater than 0'
                });
            }

            const menuItem = await MenuItem.findById(item.itemId);

            if (!menuItem || !menuItem.isAvailable) {
                return res.status(404).json({
                    success: false,
                    message: 'Menu item not available'
                });
            }

            const itemTotal = menuItem.price * Number(item.quantity);
            totalAmount += itemTotal;

            orderItems.push({
                itemId: menuItem._id,
                quantity: Number(item.quantity),
                price: menuItem.price
            });
        }

        // 🧾 Create order
        const order = await Order.create({
            tableId,
            reservationId: reservationId || null,
            userId,
            items: orderItems,
            totalAmount
        });

        // 🪑 Update table status
        await Table.findByIdAndUpdate(tableId, { status: 'occupied' });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


// ✅ GET ALL ORDERS
const getOrder = async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('tableId', 'tableNumber')
            .populate('items.itemId', 'name price');

        res.status(200).json({
            success: true,
            data: orders
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

// get order by status
const getOrderStatus = async (req, res) => {
    try {
        const { status } = req.query;

        const filter = {};

        if (status) {
            filter.orderStatus = status;
            console.log(filter.orderStatus, 'filter.orderStatus');
        }

        const order = await orderModel.find(filter)
            .populate('tableId', 'tableNumber')
            .populate('items.itemId', 'name price');
        res.status(200).json({
            success: true,
            message: 'Order status successfully',
            data: order
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params; // ✅ FIXED
        const { status } = req.body;

        // ✅ Validate status
        const allowedStatus = ['pending', 'preparing', 'served', 'completed', 'cancelled'];
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }

        const order = await orderModel.findByIdAndUpdate(
            orderId,
            { orderStatus: status },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // 🪑 Free table when completed or cancelled
        if (status === 'completed' || status === 'cancelled') {
            await Table.findByIdAndUpdate(order.tableId, { status: 'available' });
        }

        return res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};


const getActiveOrder = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(200).json({ success: false, data: null });
        }

        const activeOrder = await Order.findOne({
            userId: req.user.id,
            orderStatus: { $in: ['pending', 'preparing', 'served'] }
        })
        .populate('tableId', 'tableNumber capacity type status')
        .sort({ createdAt: -1 });

        if (!activeOrder) {
            return res.status(200).json({ success: false, data: null });
        }

        res.status(200).json({ success: true, data: activeOrder });

    } catch (error) {
        console.error('Get active order error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

const getMyOrders = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Login required' });
        }

        const orders = await Order.find({ userId: req.user.id })
            .populate('tableId', 'tableNumber')
            .populate('items.itemId', 'name price image')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: orders
        });

    } catch (error) {
        console.error('Get my orders error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error'
        });
    }
};

export default {
    createOrder,
    getOrder,
    getOrderStatus,
    updateOrderStatus,
    getMyOrders,
    getActiveOrder
}
