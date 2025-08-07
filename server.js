// Import library yang dibutuhkan
const express = require('express');
const midtransClient = require('midtrans-client');
const cors = require('cors');

// Inisialisasi aplikasi express
const app = express();
const port = 3000; // Server akan berjalan di port 3000

// Middleware untuk membaca JSON dari request body dan mengaktifkan CORS
app.use(express.json());
app.use(cors());

// Inisialisasi Midtrans Snap API
// Ganti 'YOUR_SERVER_KEY' dengan Server Key asli dari dashboard Midtrans
let snap = new midtransClient.Snap({
    isProduction: process.env.NODE_ENV === 'production',
    serverKey: process.env.MIDTRANS_SERVER_KEY, // Mengambil dari environment variable
    clientKey: process.env.MIDTRANS_CLIENT_KEY  // Mengambil dari environment variable
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
                "phone": userDetails.phone || '08123456789' // Sediakan nomor default jika tidak ada
            }
        };

        console.log("Membuat transaksi untuk:", parameter);

        // Panggil Midtrans API untuk mendapatkan token
        const transactionToken = await snap.createTransactionToken(parameter);

        console.log("Token berhasil dibuat:", transactionToken);

        // Kirim token kembali ke frontend
        res.json({ transactionToken });

    } catch (error) {
        console.error("Error creating Midtrans transaction:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Jalankan server
app.listen(port, () => {
    console.log(`Backend server berjalan di http://localhost:${port}`);
module.exports = app;
});
