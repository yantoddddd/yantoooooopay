// API QRIS - YANTO PAY
// Menggunakan Qrispy.id sesuai dokumentasi

export default async function handler(req, res) {
    // Izinkan akses dari mana saja
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Ambil nominal dari query parameter
    const { amount } = req.query;
    
    // Validasi: amount harus ada
    if (!amount) {
        return res.status(400).json({ 
            success: false, 
            error: 'Parameter amount wajib diisi' 
        });
    }
    
    // Konversi ke integer
    const nominal = parseInt(amount);
    
    // Validasi minimal nominal (Qrispy minimal Rp 5.000)
    if (nominal < 5000) {
        return res.status(400).json({ 
            success: false, 
            error: 'Minimal nominal Rp 5.000' 
        });
    }
    
    // API Token Qrispy
    const API_TOKEN = 'cki_nD0f0oL65LjelMnKdPf4DrsTbQR0IJHY3ajVbxafCHmBbtmd';
    
    try {
        // Panggil API Qrispy sesuai dokumentasi
        const response = await fetch('https://api.qrispy.id/api/payment/qris/generate', {
            method: 'POST',
            headers: {
                'X-API-Token': API_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: nominal,
                payment_reference: `YTO-${Date.now()}` // ID transaksi unik
            })
        });
        
        // Ambil respons dari Qrispy
        const data = await response.json();
        
        // Cek apakah berhasil
        if (data.status === 'success' && data.data) {
            const qris = data.data;
            
            // Kirim balik ke frontend
            return res.status(200).json({
                success: true,
                qrImageUrl: qris.qris_image_url,      // URL gambar QRIS
                qrImageBase64: qris.qris_image_base64, // Base64 QRIS (opsional)
                qrisId: qris.qris_id,
                amount: qris.amount,
                expiredAt: qris.expired_at,
                expiresIn: qris.expires_in_seconds,
                paymentReference: qris.payment_reference,
                timestamp: new Date().toISOString()
            });
        } else {
            // Gagal dari Qrispy
            throw new Error(data.message || 'Gagal generate QRIS');
        }
        
    } catch (error) {
        // Error koneksi atau lainnya
        console.error('Qrispy Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}
