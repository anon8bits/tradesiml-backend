import { Router } from "express";

const router = Router();

router.get('/', async (req, res) => {
    res.json({
        message: 'Hello from the backend!',
        timestamp: new Date().toISOString()
    });
});

export default router;