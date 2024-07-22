import { Router } from 'express';
import ClosedOrder from '../models/ClosedOrders.js';
import { checkJwt, extractEmail } from '../middlewares/auth0Middleware.js';

const router = Router();

router.get('/', checkJwt, extractEmail, async (req, res) => {
    try {
        const email = req.email;
        const orders = await ClosedOrder.find({ userEmail: email }).sort({ OrderCloseTime: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
