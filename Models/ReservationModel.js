import { Schema, model } from 'mongoose';

const reservationSchema = new Schema({
    tableId: {
        type: Schema.Types.ObjectId,
        ref: 'tables',
        required: true,
    },
    customerName: {
        type: String,
        required: true,
        trim: true,
    },
    customerPhone: {
        type: String,
        required: true,
        trim: true,
    },
    startTime: {
        type: Date,
        required: true,
    },
    endTime: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending',
    },
    createdBy: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer',
    },
}, { timestamps: true });

reservationSchema.index({ tableId: 1, startTime: 1, endTime: 1 });

const reservationModel = model('reservations', reservationSchema);

export default reservationModel;
