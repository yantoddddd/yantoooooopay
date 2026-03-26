// In-memory storage buat nyimpen status paid
const paidStatus = new Map();

export default async function handler(req, res) {
    const url = req.url || '';
    
    // 🔥 ENDPOINT UNTUK CEK STATUS (dipanggil qris.html)
    if (url.includes('/check')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const qrisId = urlParams.get('qrisId');
        
        if (qrisId && paidStatus.has(qrisId)) {
            return res.status(200).json({ paid: true, amount: paidStatus.get(qrisId).amount });
        }
        return res.status(200).json({ paid: false });
    }
    
    // 🔥 ENDPOINT UTAMA WEBHOOK (dipanggil Qrispy)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const data = req.body;
    console.log('📨 Webhook diterima:', JSON.stringify(data, null, 2));
    
    const TELEGRAM_TOKEN = '8236149325:AAGDPsOD5HuK-sVcGaEE-v80QKd60A_9ehU';
    const TELEGRAM_CHAT_ID = '8182530431';
    
    const formatRp = (n) => new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR', 
        minimumFractionDigits: 0 
    }).format(n);
    
    let message = '';
    let isPayment = false;
    
    if (data.event === 'payment.received') {
        const nominal = data.data.amount;
        const qrisId = data.data.qris_id;
        const uniqueId = data.data.unique_id;
        
        // 🔥 SIMPAN STATUS PAID
        paidStatus.set(qrisId, { paid: true, amount: nominal, timestamp: Date.now() });
        console.log(`✅ Status paid disimpan untuk QRIS: ${qrisId}`);
        
        message = `✅ *PEMBAYARAN DITERIMA!*\n\n` +
            `💰 *${formatRp(nominal)}* telah masuk ke akun mu\n` +
            `🆔 ID QRIS: \`${qrisId}\`\n` +
            `🔢 Kode Unik: ${uniqueId}\n` +
            `📅 Waktu: ${new Date().toLocaleString('id-ID')}\n\n` +
            `---\nYANTO PAY`;
        isPayment = true;
    } else {
        message = `🔔 *Webhook Test*\n\nEvent: ${data.event}\nWaktu: ${new Date().toLocaleString('id-ID')}`;
    }
    
    // Kirim ke Telegram
    console.log('📤 Mengirim ke Telegram...');
    
    try {
        const tgResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        
        const tgResult = await tgResponse.json();
        console.log('📨 Response Telegram:', JSON.stringify(tgResult, null, 2));
        
        if (tgResult.ok) {
            console.log('✅ Telegram berhasil!');
        } else {
            console.error('❌ Telegram error:', tgResult);
        }
        
        return res.status(200).json({ 
            received: true, 
            event: data.event,
            telegram: tgResult.ok,
            paid: isPayment,
            qrisId: isPayment ? data.data.qris_id : null
        });
        
    } catch (error) {
        console.error('❌ Error kirim Telegram:', error);
        return res.status(200).json({ 
            received: true, 
            event: data.event,
            error: error.message
        });
    }
}
