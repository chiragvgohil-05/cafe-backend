import { Schema, model } from 'mongoose';

const orderSchema = new Schema({
    tableId: {
        type: Schema.Types.ObjectId,
        ref: 'tables',
        required: true,
    },

    reservationId: {
        type: Schema.Types.ObjectId,
        ref: 'reservations',
        required: false,
    },

    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: false,
    },

    items: [
        {
            itemId: {
                type: Schema.Types.ObjectId,
                ref: 'MenuItem',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            price: {
                type: Number,
                required: true,
            },
        }
    ],

    totalAmount: {
        type: Number,
        required: true,
    },

    orderStatus: {
        type: String,
        enum: ['pending', 'preparing', 'served', 'completed', 'cancelled'],
        default: 'pending',
    },

    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid'],
        default: 'unpaid',
    },
    // 🔽 Razorpay Fields
    razorpayOrderId: {
        type: String,
    },

    razorpayPaymentId: {
        type: String,
    },

    razorpaySignature: {
        type: String,
    },

    paymentMethod: {
        type: String,
    },

    paidAt: {
        type: Date,
    }

}, { timestamps: true });

const orderModel = model('orders', orderSchema);
export default orderModel;
