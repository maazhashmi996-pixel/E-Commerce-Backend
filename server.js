const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// --- 1. MongoDB Connection ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch(err => console.log("❌ DB Connection Error:", err));

// --- 2. Routes Import (Sirf aik baar) ---
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

// --- 3. Routes Middleware Configuration ---
app.use('/api/admin', adminRoutes);     // Admin login, signup, stats, update status
app.use('/api/products', productRoutes);  // Product add, update, delete, like
app.use('/api/orders', orderRoutes);      // User order placement, tracking

// --- 4. Welcome Route (Optional) ---
app.get('/', (req, res) => {
    res.send("🚀 AssanRishta Full Stack API is running...");
});

// --- 5. Server Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is flying on port ${PORT}`);
});