export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const { amount } = req.query;
    const DANA_NUMBER = "089676041776";
    
    if (!amount) {
        return res.status(400).json({ error: 'Parameter amount wajib diisi' });
    }
    
    const nominal = parseInt(amount);
    
    if (nominal < 5000) {
        return res.status(400).json({ error: 'Minimal nominal Rp 5.000' });
    }
    
    try {
        const response = await fetch('https://api.qrispy.id/api/payment/qris/generate', {
            method: 'POST',
            headers: {
                'X-API-Token': 'cki_nD0f0oL65LjelMnKdPf4DrsTbQR0IJHY3ajVbxafCHmBbtmd',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: nominal,
                payment_reference: `YTO-${Date.now()}`
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success' && data.data) {
            const qrisData = data.data;
            const trxId = qrisData.qris_id;
            
            return res.status(200).json({
                success: true,
                qrUrl: qrisData.qris_image_url,
                qrisId: qrisData.qris_id,
                trxId: trxId,
                nominal: qrisData.amount,
                fee: 0,
                total: qrisData.amount,
                phone: DANA_NUMBER,
                expiredAt: qrisData.expired_at,
                expiresIn: qrisData.expires_in_seconds,
                timestamp: new Date().toISOString()
            });
        } else {
            throw new Error(data.message || 'Gagal generate QRIS');
        }
        
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            error: error.message
        });
    }
}
