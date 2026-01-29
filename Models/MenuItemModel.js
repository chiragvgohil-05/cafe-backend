import { Schema, model } from 'mongoose';

const menuItemSchema = new Schema({

    cafeId: {
        type: Schema.Types.ObjectId,
        ref: 'cafes',
        required: true,
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'MenuCategory',
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: String,
    price: {
        type: Number,
        required: true,
    },
    image: String,
    isAvailable: {
        type: Boolean,
        default: true,
    },

}, { timestamps: true });

const menuItemModel = model('MenuItem', menuItemSchema);

export default menuItemModel;