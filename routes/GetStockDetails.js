import { Router } from "express";
import Stock from "../models/Stocks.js";

const router = Router();

router.get('/:Symbol', async (req, res) => {
    const {Symbol} = req.params;
    try {
        const data = await Stock.findOne({Symbol : Symbol});
        res.json(data);
    } catch (error) {
        console.log('Error getting data for stock: ', Symbol);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;