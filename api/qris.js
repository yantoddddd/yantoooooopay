// api/qris.js - YANTO PAY BACKEND
// Semua data sensitif ada di sini, tidak terlihat di frontend

const QRISPY_TOKEN = 'cki_MDT3cC14ASTcV9yCcZOEOROZFqVgNvZlWjsC5ofjrp3x2DBe';
const QRISPY_API = 'https://api.qrispy.id';
const WEBHOOK_URL = 'https://yantoooooopay.vercel.app/api/webhook';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const { amount } = req.query;
    
    if (!amount) return res.status(400).json({ error: 'Nominal wajib diisi' });
    const nominal = parseInt(amount);
    if (nominal < 1000) return res.status(400).json({ error: 'Minimal Rp 1.000' });
    
    try {
        const response = await fetch(`${QRISPY_API}/api/payment/qris/generate`, {
            method: 'POST',
            headers: {
                'X-API-Token': QRISPY_TOKEN,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount: nominal, webhook_url: WEBHOOK_URL })
        });
        
        const data = await response.json();
        
        if (data.status === 'success') {
            const trxId = 'YNTO-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();
            
            return res.status(200).json({
                success: true,
                qrUrl: data.data.qris_image_url,
                qrisId: data.data.qris_id,
                amount: data.data.amount,
                trxId: trxId,
                expiredAt: data.data.expired_at,
                expiresIn: data.data.expires_in_seconds
            });
        } else {
            throw new Error(data.message || 'Gagal generate QRIS');
        }
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
          }
