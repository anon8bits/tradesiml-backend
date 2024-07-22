import { Router } from "express";
import OpenOrder from "../models/OpenOrders.js";
import { checkJwt, extractEmail } from '../middlewares/auth0Middleware.js'

const router = Router();

router.get('/:orderID', checkJwt, extractEmail, async (req, res) => {
    const orderID = req.params.orderID;
    const email = req.body.email;
    try {
        const order = await OpenOrder.findById(orderID);
        if (!order) {
            return res.status(404).send('Order not found');
        }

        if (order.userEmail === email) {
            return res.json(order);
        } else {
            return res.status(403).send('Forbidden');
        }
    } catch (error) {
        return res.status(500).send('Server error');
    }
});

export default router;