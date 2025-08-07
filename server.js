// Import library yang dibutuhkan
const express = require('express');
const midtransClient = require('midtrans-client');
const cors = require('cors');

// Inisialisasi aplikasi express
const app = express();

// Middleware untuk membaca JSON dari request body dan mengaktifkan CORS
app.use(express.json());
app.use(cors());

// Inisialisasi Midtrans Snap API
let snap = new midtransClient.Snap({
    isProduction: process.env.NODE_ENV === 'production',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

// Buat endpoint untuk membuat token transaksi
app.post('/create-transaction', async (req, res) => {
    try {
        const { planType, isYearly, amount, userDetails } = req.body;

        // Buat ID pesanan yang unik
        const orderId = `ORDER-${planType}-${Date.now()}`;
        const itemName = `${planType.charAt(0).toUpperCase() + planType.slice(1)} Plan (${isYearly ? 'Tahunan' : 'Bulanan'})`;

        // Siapkan parameter transaksi untuk Midtrans
        let parameter = {
            "transaction_details": {
                "order_id": orderId,
                "gross_amount": amount
            },
            "item_details": [{
                "id": planType,
                "price": amount,
                "quantity": 1,
                "name": itemName
            }],
            "customer_details": {
                "first_name": userDetails.name,
                "email": userDetails.email,
                "phone": userDetails.phone || '08123456789'
            }
        };

        const transactionToken = await snap.createTransactionToken(parameter);
        res.json({ transactionToken });

    } catch (error) {
        console.error("Error creating Midtrans transaction:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Pastikan baris ini ada di paling bawah dan tidak di dalam blok lain
module.exports = app;