const router = require('express').Router();
const Order = require('../models/Order');
const { nanoid } = require('nanoid');

// Create Order
router.post('/place-order', async (req, res) => {
    try {
        const trackingCode = `TRK-${nanoid(8).toUpperCase()}`; // Example: TRK-A1B2C3D4
        const newOrder = new Order({
            ...req.body,
            trackingCode
        });
        await newOrder.save();
        res.status(201).json({ message: "Order Placed!", trackingCode });
    } catch (err) {
        res.status(500).json(err);
    }
});

// User Tracking Route
router.get('/track/:code', async (req, res) => {
    try {
        const order = await Order.findOne({ trackingCode: req.params.code });
        if (!order) return res.status(404).json("Code invalid!");
        res.json({ status: order.status, lastUpdate: order.updatedAt });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;