import { Router } from "express";
import User from "../models/Users.js";
import { checkJwt, extractEmail } from '../middlewares/auth0Middleware.js'

const router = Router();

router.post('/', checkJwt, extractEmail, async (req, res) => {
    const email = req.email;
    const amount = Number(req.body.amount);

    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
    }

    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (amount > 1000000) {
            return res.status(403).json({ message: "Amount exceeded the maximum allowed limit (10,00,000)" });
        }

        const newBalance = user.balance + amount;

        if (newBalance > 10000000) {
            return res.status(403).json({ message: "Transaction would exceed maximum account balance (1,00,00,000)" });
        }

        user.balance = newBalance;
        await user.save();

        res.status(200).json({ message: "Success", newBalance: user.balance });
    } catch (error) {
        console.error('Error in add money endpoint:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;