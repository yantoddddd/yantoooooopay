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
        // API Qrispy
        const response = await fetch('https://qrispy.id/api/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer cki_nD0f0oL65LjelMnKdPf4DrsTbQR0IJHY3ajVbxafCHmBbtmd'
            },
            body: JSON.stringify({
                amount: nominal,
                note: `Top up DANA ${DANA_NUMBER}`
            })
        });
        
        const data = await response.json();
        
        if (data.status === 'success' && data.qr_code) {
            const trxId = 'YTO' + Date.now().toString(36).toUpperCase();
            
            return res.status(200).json({
                success: true,
                qrUrl: data.qr_code,
                trxId: trxId,
                nominal: nominal,
                fee: 0,
                total: nominal,
                phone: DANA_NUMBER,
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