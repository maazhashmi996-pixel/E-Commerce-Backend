const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true }, // e.g., 'Winter', 'Summer'
    section: { type: String, default: 'General' }, // Admin dynamic section add kar sakay
    images: { type: [String], required: true }, // Array for 5 images
    likes: { type: Number, default: 0 },
    isOutOfStock: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);