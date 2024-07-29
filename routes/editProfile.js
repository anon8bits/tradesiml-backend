import { Router } from "express";
import { checkJwt, extractEmail } from "../middlewares/auth0Middleware.js";
import User from "../models/Users.js";
import mongoose from "mongoose";

const router = Router();

router.post('/', checkJwt, extractEmail, async (req, res) => {
    const email = req.email;
    const { newName } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Update user's name
        const user = await User.findOneAndUpdate(
            { email },
            { name: newName },
            { session, new: true }
        );

        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ 
                errorCode: 'USER_NOT_FOUND',
                message: 'User not found' 
            });
        }

        await session.commitTransaction();
        res.json({ message: 'User name updated successfully', user });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ 
            errorCode: 'SERVER_ERROR',
            message: 'An unexpected error occurred' 
        });
    } finally {
        session.endSession();
    }
});

export default router;