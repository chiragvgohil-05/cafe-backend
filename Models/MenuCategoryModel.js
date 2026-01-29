import { Schema, model } from 'mongoose';

const menuCategorySchema = new Schema({
    cafeId: {
        type: Schema.Types.ObjectId,
        ref: 'cafes',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const menuCategoryModel = model('MenuCategory', menuCategorySchema);

export default menuCategoryModel;