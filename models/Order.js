const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    trackingCode: { type: String, unique: true }, // User isse track karega
    customerDetails: {
        firstName: String,
        lastName: String,
        mobile: String,
        streetAddress: String,
        city: String,
        state: String
    },
    items: Array, // Cart products
    totalAmount: Number,
    paymentMethod: { type: String, enum: ['JazzCash', 'COD'] },
    status: {
        type: String,
        default: 'Order Placed',
        enum: ['Order Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);