import { Router } from 'express';
import OpenOrder from '../models/OpenOrders.js';
import { checkJwt, extractEmail } from '../middlewares/auth0Middleware.js';

const router = Router();

router.get('/', checkJwt, extractEmail, async (req, res) => {
  try {
    const email = req.email;
    if (!email) {
      return res.status(400).json({ error: 'Email not found in token' });
    }

    const orders = await OpenOrder.find({ userEmail: email }).sort({ orderStartTime: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
