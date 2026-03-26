// In-memory storage (akan reset kalau server restart, tapi cukup buat demo)
const paidStatus = new Map();

export default async function handler(req, res) {
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
    
    // 🔥 Cek event pembayaran sukses
    if (data.event === 'payment.received') {
        const nominal = data.data.amount;
        const qrisId = data.data.qris_id;
        const uniqueId = data.data.unique_id;
        
        // 🔥 SIMPAN STATUS PAID (biar bisa diambil qris.html)
        paidStatus.set(qrisId, { paid: true, amount: nominal, timestamp: Date.now() });
        console.log(`✅ Status paid disimpan untuk QRIS: ${qrisId}`);
        
        // Kirim notif Telegram
        const message = `✅ *PEMBAYARAN DITERIMA!*\n\n` +
            `💰 *${formatRp(nominal)}* telah masuk ke akun mu\n` +
            `🆔 ID QRIS: \`${qrisId}\`\n` +
            `🔢 Kode Unik: ${uniqueId}\n` +
            `📅 Waktu: ${new Date().toLocaleString('id-ID')}\n\n` +
            `---\nYANTO PAY`;
        
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
        
        console.log('✅ Notif Telegram terkirim');
        
        return res.status(200).json({ 
            received: true, 
            event: data.event,
            paid: true,
            qrisId: qrisId
        });
    }
    
    // 🔥 Endpoint buat ngecek status (dipanggil qris.html)
    if (req.url.includes('/check')) {
        const urlParams = new URLSearchParams(req.url.split('?')[1]);
        const qrisId = urlParams.get('qrisId');
        if (qrisId && paidStatus.has(qrisId)) {
            return res.status(200).json({ paid: true, amount: paidStatus.get(qrisId).amount });
        }
        return res.status(200).json({ paid: false });
    }
    
    // Test webhook
    if (data.event === 'payment.test') {
        console.log('🔔 Test webhook received');
        return res.status(200).json({ received: true, event: 'test' });
    }
    
    return res.status(200).json({ received: true, event: data.event });
}
