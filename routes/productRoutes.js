const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const upload = require('../config/cloudinary'); // Cloudinary config file

// --- 1. ADD NEW PRODUCT (Admin Only) ---
// Ismein 'images' ka array 5 pics tak accept hoga
router.post('/add', upload.array('images', 5), async (req, res) => {
    try {
        const imageUrls = req.files.map(file => file.path); // Cloudinary URLs

        const newProduct = new Product({
            title: req.body.title,
            description: req.body.description,
            price: req.body.price,
            category: req.body.category, // e.g. 'Dresses'
            section: req.body.section,   // e.g. 'Winter', 'Summer', 'Eid'
            images: imageUrls,           // 5 Images Store ho rahi hain
            isOutOfStock: req.body.isOutOfStock || false
        });

        await newProduct.save();
        res.status(201).json({ message: "Product Added Successfully!", product: newProduct });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 2. GET ALL PRODUCTS (User Side) ---
router.get('/all', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 3. GET SINGLE PRODUCT (Details Page) ---
router.get('/details/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json("Product not found!");
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 4. UPDATE PRODUCT (Safe Update - No Image Loss) ---
router.put('/update/:id', upload.array('images', 5), async (req, res) => {
    try {
        let updateData = { ...req.body };

        // Agar admin ne nayi pics upload ki hain, sirf tabhi update karein
        if (req.files && req.files.length > 0) {
            updateData.images = req.files.map(file => file.path);
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        res.json({ message: "Product Updated!", updatedProduct });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 5. LIKE PRODUCT (No Login Required) ---
router.post('/like/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json("Product not found!");

        product.likes += 1;
        await product.save();

        res.json({ message: "Liked!", likes: product.likes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 6. DELETE PRODUCT ---
router.delete('/delete/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product Deleted!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;