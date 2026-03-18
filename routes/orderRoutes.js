const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { nanoid } = require('nanoid'); // nanoid unique ID ke liye best hai

// --- 1. PLACE ORDER (User Side Checkout) ---
router.post('/place-order', async (req, res) => {
    try {
        // Unique Tracking Code generate karein (e.g., TRK-X7Y2Z9W1)
        const trackingCode = `TRK-${nanoid(8).toUpperCase()}`;

        // Req.body mein user ka saara data aana chahiye (Jo aapne screenshot mein dikhaya)
        const newOrder = new Order({
            trackingCode: trackingCode,
            customerDetails: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                mobile: req.body.mobile,
                streetAddress: req.body.streetAddress,
                city: req.body.city,
                state: req.body.state
            },
            items: req.body.items, // Cart products ka array
            totalAmount: req.body.totalAmount,
            paymentMethod: req.body.paymentMethod, // 'JazzCash' ya 'COD'
            status: 'Order Placed' // Initial status
        });

        const savedOrder = await newOrder.save();

        res.status(201).json({
            success: true,
            message: "Mubarak ho! Aapka order place ho gaya hai.",
            trackingCode: savedOrder.trackingCode
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// --- 2. USER TRACKING ROUTE ---
// User website par tracking code daal kar status check karega
router.get('/track/:code', async (req, res) => {
    try {
        const order = await Order.findOne({ trackingCode: req.params.code.toUpperCase() });

        if (!order) {
            return res.status(404).json({ message: "Ghalat tracking code! Dubara check karein." });
        }

        // User ko sirf zaroori details dikhayenge
        res.json({
            status: order.status,
            customerName: order.customerDetails.firstName,
            paymentMethod: order.paymentMethod,
            totalAmount: order.totalAmount,
            lastUpdate: order.updatedAt
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 3. GET SINGLE ORDER DETAILS (Admin/User Reference) ---
router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        res.json(order);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;