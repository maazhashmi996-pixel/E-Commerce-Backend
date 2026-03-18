const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const Order = require('../models/Order');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- 1. ADMIN SIGNUP (One-Time Logic) ---
router.post('/signup', async (req, res) => {
    try {
        const adminExists = await Admin.findOne();
        if (adminExists) {
            return res.status(400).json({ message: "Admin account already exists!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newAdmin = new Admin({
            username: req.body.username,
            password: hashedPassword
        });

        await newAdmin.save();
        res.status(201).json({ message: "Admin Registered Successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 2. ADMIN LOGIN ---
router.post('/login', async (req, res) => {
    try {
        const admin = await Admin.findOne({ username: req.body.username });
        if (!admin) return res.status(400).json({ message: "Invalid Username!" });

        const validPassword = await bcrypt.compare(req.body.password, admin.password);
        if (!validPassword) return res.status(400).json({ message: "Invalid Password!" });

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, message: "Welcome Back Admin!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 3. DASHBOARD ANALYTICS (Total Sales & Counts) ---
router.get('/stats', async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const totalProducts = await Product.countDocuments();

        // Sirf 'Delivered' orders ki amount ko jama (sum) karein
        const sales = await Order.aggregate([
            { $match: { status: 'Delivered' } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
        ]);

        res.json({
            totalOrders,
            totalProducts,
            totalRevenue: sales.length > 0 ? sales[0].totalRevenue : 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 4. ALL ORDERS (Admin List) ---
router.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json(err);
    }
});

// --- 5. UPDATE ORDER STATUS (Tracking System Update) ---
router.put('/order-status/:id', async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );
        res.json({ message: "Status Updated!", updatedOrder });
    } catch (err) {
        res.status(500).json(err);
    }
});

// --- 6. MANAGE SECTIONS (Winter, Summer, Eid etc.) ---
// Admin can change section of any product
router.put('/product-section/:id', async (req, res) => {
    try {
        const { section } = req.body; // e.g., "Winter Sale"
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { section: section },
            { new: true }
        );
        res.json({ message: `Product moved to ${section}`, product });
    } catch (err) {
        res.status(500).json(err);
    }
});

// --- 7. DELETE PRODUCT ---
router.delete('/product/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product Deleted Successfully!" });
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;