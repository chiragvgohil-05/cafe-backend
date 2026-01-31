import { Schema, model } from 'mongoose';

const tableSchema = new Schema({
    tableNumber: {
        type: String,
        required: true,
        unique: true,
    },

    capacity: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['available', 'occupied', 'reserved'],
        default: 'available',
    },

    isActive: {
        type: Boolean,
        default: true,
    },

}, { timestamps: true });

const tableModel = model('tables', tableSchema);

export default tableModel;
