import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const closedOrderSchema = new Schema({
    userEmail: {
        type: String,
        ref: 'user',
        required: true
    },
    type: {
        type: String
    },
    stockName: {
        type: String,
        required: true
    },
    entryPrice: {
        type: Number,
        required: true
    },
    tradePrice: {
        type: Number,
        required: true
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
        required: true
    },
    status: {
        type: String
    },
    PL: {
        type: Number,
        default: 0
    },
    OrderStartTime: {
        type: Date
    },
    OrderCloseTime: {
        type: Date
    }
});

const ClosedOrder = model('ClosedOrder', closedOrderSchema);

export default ClosedOrder;
