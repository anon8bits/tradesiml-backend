// middleware/validateOrder.js
import Joi from 'joi';
import User from '../models/Users.js';
import Stock from '../models/Stocks.js';

const orderSchema = Joi.object({
    email: Joi.string().email().required(),
    entryPrice: Joi.number().min(0).required(),
    orderQuantity: Joi.number().integer().min(1).required(),
    orderType: Joi.string().valid('Buy', 'Sell').required(),
    stopLoss: Joi.number().min(0).allow(0),
    symbol: Joi.string().required(),
    targetPrice: Joi.number().min(0).required(),
    timeFrame: Joi.number().min(1).max(7).required()
});

export const validateOrder = async (req, res, next) => {
    try {
        const { error } = orderSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { email, entryPrice, orderQuantity, symbol } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        const stock = await Stock.findOne({ Symbol: symbol });
        if (!stock) {
            return res.status(400).json({ error: 'Invalid stock symbol' });
        }

        const orderValue = entryPrice * orderQuantity;
        if (orderValue > user.balance) {
            return res.status(400).json({ error: 'Insufficient balance' });
        }

        req.user = user;
        req.stock = stock;
        req.amount = orderValue;

        next();
    } catch (error) {
        res.status(500).json({ error: 'An error occurred during validation' });
    }
};

export default validateOrder;