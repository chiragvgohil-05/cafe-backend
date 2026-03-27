import { Schema, model } from 'mongoose';

const reservationSchema = new Schema({
    table: {
        type: Schema.Types.ObjectId,
        ref: 'tables',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: false // Optional, for registered users
    },
    guestDetails: {
        name: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        specialRequest: { type: String }
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    startTime: {
        type: String, // Format: HH:mm
        required: true
    },
    endTime: {
        type: String, // Format: HH:mm
        required: true
    },
    guests: {
        type: Number,
        required: true
    },
    securityAmount: {
        type: Number,
        default: 100
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'failed'],
        default: 'unpaid'
    },
    razorpayOrderId: {
        type: String
    },
    razorpayPaymentId: {
        type: String
    },
    razorpaySignature: {
        type: String
    },
    paidAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    }
}, { timestamps: true });

const ReservationModel = model('reservations', reservationSchema);

export default ReservationModel;
