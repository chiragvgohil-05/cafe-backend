import Order from '../../Models/OrderModel.js';
import MenuItem from '../../Models/MenuItemModel.js';
import Table from '../../Models/TableModel.js';
import cafeModel from '../../Models/CafeModel.js';
import orderModel from '../../Models/OrderModel.js';

const createOrder = async (req, res) => {
    try {
        const { tableId, items } = req.body;
        const ownerId = req.user.id;

        if (!tableId || !items || items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'tableId and items are required'
            });
        }

        // 🔐 Find cafe from logged-in owner
        const cafe = await cafeModel.findOne({ isOwner: ownerId });

        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'Cafe not found for this user'
            });
        }

        let totalAmount = 0;
        const orderItems = [];

        for (const item of items) {
            const menuItem = await MenuItem.findById(item.itemId);

            if (!menuItem) {
                return res.status(404).json({
                    success: false,
                    message: 'Menu item not found'
                });
            }

            const itemTotal = menuItem.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                itemId: menuItem._id,
                quantity: item.quantity,
                price: menuItem.price
            });
        }

        // 🧾 Create order
        const order = await Order.create({
            cafeId: cafe._id,
            tableId,
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


// ✅ GET ALL ORDERS (without cafeId param)
const getOrder = async (req, res) => {
    try {
        const ownerId = req.user.id;

        // 🔐 Find cafe of logged-in user
        const cafe = await cafeModel.findOne({ isOwner: ownerId });

        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'Cafe not found'
            });
        }

        const orders = await Order.find({ cafeId: cafe._id })
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
        const ownerId = req.user.id;
        const { status } = req.query;

        const cafe = await cafeModel.findOne({isOwner: ownerId});
        if (!cafe) {
            return res.status(404).json({
                success: false,
                message: 'Cafe not found'
            })
        }

        const filter = { cafeId: cafe._id };

        if(status) {
            filter.orderStatus = status;
            console.log(filter.orderStatus,'filter.orderStatus');
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


export default {
    createOrder,
    getOrder,
    getOrderStatus,
    updateOrderStatus
}
