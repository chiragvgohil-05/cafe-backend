import { Schema, model } from 'mongoose';

const tableSchema = new Schema({
    cafeId: {
        type: Schema.Types.ObjectId,
        ref: 'cafes',
        required: true,
    },

    tableNumber: {
        type: String,
        required: true,
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

tableSchema.index({ cafeId: 1, tableNumber: 1 }, { unique: true });
const tableModel = model('tables', tableSchema);

export default tableModel;
