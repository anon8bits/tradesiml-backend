import { Router } from "express";
import validateOrder from '../middlewares/validateOrder.js';
import OpenOrder from "../models/OpenOrders.js";
import User from "../models/Users.js";
import mongoose from "mongoose";
import { checkJwt, extractEmail } from "../middlewares/auth0Middleware.js";

const router = Router();

router.post('/', checkJwt, extractEmail, validateOrder, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            entryPrice,
            orderQuantity,
            orderType,
            stopLoss,
            symbol,
            targetPrice,
            timeFrame,
            email
        } = req.body;
        const currentStockPrice = req.stock.LTP;
        let triggered = false;
        if (orderType === 'Buy') {
            triggered = currentStockPrice <= entryPrice;
        } else if (orderType === 'Sell') {
            triggered = currentStockPrice >= entryPrice;
        }

        const validity = Date.now() + 24 * 60 * 60 * 1000 * timeFrame;

        const newOrder = new OpenOrder({
            userEmail: email,
            stockName: symbol,
            entryPrice,
            orderQuantity,
            targetPrice,
            stopLoss,
            type: orderType,
            triggered,
            PL: triggered ? 0 : null,
            validity: validity
        });

        await newOrder.save({ session });

        // Deduct balance from user
        const user = await User.findOneAndUpdate(
            { email: email },
            { $inc: { balance: -req.amount } },
            { new: true, session }
        );

        if (!user) {
            throw new Error('User not found');
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(newOrder);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error);

        if (error.message === 'User not found') {
            return res.status(404).json({ error: 'User not found' });
        }

        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }

        if (error.name === 'MongoError' && error.code === 11000) {
            return res.status(409).json({ error: 'Duplicate order' });
        }

        res.status(500).json({ error: 'An error occurred while processing your order' });
    }
});

export default router;