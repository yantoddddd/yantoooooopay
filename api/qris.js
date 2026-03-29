// api/qris.js
const QRISPY_TOKEN = 'cki_MDT3cC14ASTcV9yCcZOEOROZFqVgNvZlWjsC5ofjrp3x2DBe';
const QRISPY_API = 'https://api.qrispy.id';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { amount } = req.query;
    
    if (!amount) return res.status(400).json({ error: 'Nominal wajib diisi' });
    
    const nominal = parseInt(amount);
    
    // ✅ UBAH MINIMAL JADI 100 (bukan 1000 atau 5000)
    if (nominal < 100) {
        return res.status(400).json({ error: 'Minimal Rp 100' });
    }
    
    try {
        const response = await fetch(`${QRISPY_API}/api/payment/qris/generate`, {
            method: 'POST',
            headers: {
                'X-API-Token': QRISPY_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount: nominal })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            const trxId = 'YNTO-' + Date.now().toString(36).toUpperCase();
            
            return res.status(200).json({
                success: true,
                qrUrl: data.data.qris_image_url,
                qrisId: data.data.qris_id,
                amount: data.data.amount,
                trxId: trxId,
                expiredAt: data.data.expired_at
            });
        } else {
            throw new Error(data.message || 'Gagal generate QRIS');
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}
