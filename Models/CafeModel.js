import { Schema, model } from 'mongoose'

const cafeSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    address: {
        type: String,
        required: [true, 'Address is required'],
    },
    openTime: {
        type: String,
        required: [true, 'OpenTime is required'],
    },
    closeTime: {
        type: String,
        required: [true, 'CloseTime is required'],
    },
    isOpen: {
        type: Boolean,
        default: true
    },
    isOwner:{
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: [true, 'IsOwner is required'],
    }

}, {timestamps: true });

const cafeModel = model("cafes", cafeSchema);
export default cafeModel;