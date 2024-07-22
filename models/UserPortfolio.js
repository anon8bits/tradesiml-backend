import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const portfolioSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true
    },
    openOrders: [{
        type: Schema.Types.ObjectId,
        ref: 'OpenOrder'
    }],
    closedOrders: [{
        type: Schema.Types.ObjectId,
        ref: 'ClosedOrder'
    }],
    currentBalance: {
        type: Number,
        default: 0
    },
    totalProfitLoss: {
        type: Number,
        default: 0
    }
});

const Portfolio = model('Portfolio', portfolioSchema);

export default Portfolio;
