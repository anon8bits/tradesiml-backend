import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const openOrderSchema = new Schema({
    userEmail: {
        type: String,
        ref: 'user',
        required: true
    },
    stockName: {
        type: String,
        required: true
    },
    entryPrice: {
        type: Number,
        required: false
    },
    orderQuantity: {
        type: Number,
        required: true
    },
    targetPrice: {
        type: Number,
        required: true
    },
    stopLoss: {
        type: Number,
        required: false
    },
    validity: {
        type: Date,
        required: true,
        default: () => Date.now() + 24 * 60 * 60 * 1000
    },
    type: {
        type: String,
    },
    OrderStartTime: {
        type: Date,
        required: true,
        default: Date.now()
    },
    triggered : {
        type: Boolean,
        required: true
    },
    PL : {
        type: Number
    }
});

const OpenOrder = model('OpenOrder', openOrderSchema);

export default OpenOrder;
