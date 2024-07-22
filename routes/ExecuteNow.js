import { Router } from "express";
import { Types } from "mongoose";
import mongoose from "mongoose";
import OpenOrder from "../models/OpenOrders.js";
import Stocks from "../models/Stocks.js";
import ClosedOrder from "../models/ClosedOrders.js";
import User from "../models/Users.js";
import { checkJwt, extractEmail } from '../middlewares/auth0Middleware.js'

const router = Router();

router.post('/:orderId', checkJwt, extractEmail, async (req, res) => {
    const orderId = req.params.orderId;
    const email = req.email;
    if (!Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ error: "Invalid order ID" });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await OpenOrder.findById(orderId).session(session);
        if (!order) {
            throw new Error("Order not found");
        }

        if (order.userEmail !== email) {
            throw new Error("Unauthorized access");
        }

        if (!order.triggered) {
            throw new Error("Order not triggered");
        }

        const stock = await Stocks.findOne({ Symbol: order.stockName }).session(session);
        if (!stock) {
            throw new Error("Stock not found");
        }

        let pl;
        if (order.type === 'Buy') {
            pl = stock.LTP - order.entryPrice;
        } else if (order.type === 'Sell') {
            pl = order.entryPrice - stock.LTP;
        } else {
            throw new Error("Invalid order type");
        }

        const totalPL = pl * order.orderQuantity;
        const totalAmount = stock.LTP * order.orderQuantity;

        const closedOrder = new ClosedOrder({
            userEmail: order.userEmail,
            type: order.type,
            stockName: order.stockName,
            entryPrice: order.entryPrice,
            tradePrice: stock.LTP,
            orderQuantity: order.orderQuantity,
            targetPrice: order.targetPrice,
            stopLoss: order.stopLoss,
            status: "Early execution by user",
            PL: totalPL,
            OrderStartTime: order.orderStartTime,
            OrderCloseTime: new Date()
        });

        await closedOrder.save({ session });
        await OpenOrder.findByIdAndDelete(orderId, { session });

        const updatedUser = await User.findOneAndUpdate(
            { email: email },
            {
                $inc: {
                    balance: totalAmount,
                    netPL: totalPL
                }
            },
            { new: true, session }
        );

        if (!updatedUser) {
            throw new Error("User not found");
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            message: "Order executed successfully",
            closedOrder,
            updatedBalance: updatedUser.balance,
            updatedNetPL: updatedUser.netPL
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Error executing order:", error);
        if (error.message === "Order not found" || error.message === "Stock not found" || error.message === "User not found") {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === "Unauthorized access") {
            return res.status(403).json({ error: error.message });
        }
        if (error.message === "Order not triggered" || error.message === "Invalid order type") {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;