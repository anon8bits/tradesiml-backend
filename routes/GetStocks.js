import { Router } from "express";
import Stocks from '../models/Stocks.js';

const router = Router();

router.get('/:index', async (req, res) => {
    try {
        const { index } = req.params;
        const stocks = await Stocks.find({ Index: { $in: [index] } });
        res.json(stocks);
    } catch (error) {
        console.error('Error fetching stocks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
