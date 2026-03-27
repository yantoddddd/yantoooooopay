// In-memory storage
const paidStatus = new Map();
const idMapping = new Map();

export default async function handler(req, res) {
    const url = req.url || '';
    
    // 🔥 Endpoint buat nyimpan mapping ID (dipanggil dari index.html)
    if (url.includes('/save-mapping')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const qrisId = urlParams.get('qrisId');
        const customId = urlParams.get('customId');
        if (qrisId && customId) {
            idMapping.set(qrisId, customId);
            console.log(`✅ Mapping saved: ${qrisId} -> ${customId}`);
            return res.status(200).json({ success: true });
        }
        return res.status(400).json({ error: 'Missing params' });
    }
    
    // 🔥 Endpoint buat cek status (dipanggil qris.html)
    if (url.includes('/check')) {
        const urlParams = new URLSearchParams(url.split('?')[1]);
        const qrisId = urlParams.get('qrisId');
        if (qrisId && paidStatus.has(qrisId)) {
            return res.status(200).json({ paid: true });
        }
        return res.status(200).json({ paid: false });
    }
    
    // 🔥 Webhook utama
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
    
    if (data.event === 'payment.received') {
        const nominal = data.data.amount;
        const qrisId = data.data.qris_id;
        const uniqueId = data.data.unique_id;
        
        // Simpan status paid
        paidStatus.set(qrisId, true);
        console.log(`✅ Status paid disimpan untuk QRIS: ${qrisId}`);
        
        // Ambil ID custom dari mapping (kalau ada)
        const customId = idMapping.get(qrisId) || qrisId;
        
        // 🔥 FORMAT WAKTU WIB (Asia/Jakarta)
        const waktu = new Date().toLocaleString('id-ID', { 
            timeZone: 'Asia/Jakarta',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // 🔥 PESAN TELEGRAM
        const message = `✅ *TRANSAKSI BERHASIL!*\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n` +
            `📋 *DETAIL TRANSAKSI*\n` +
            `━━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `🧾 *Id Qris:* \`${customId}\`\n` +
            `💰 *Total:* ${formatRp(nominal)}\n` +
            `⏰ *Waktu Bayar:* ${waktu}\n` +
            `━━━━━━━━━━━━━━━━━━━━━━`;
        
        // Kirim ke Telegram
        console.log('📤 Mengirim ke Telegram...');
        console.log('Pesan:', message);
        
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
                customId: customId,
                waktu: waktu
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
    
    // Event lain (test, dll)
    if (data.event === 'payment.test') {
        console.log('🔔 Test webhook received');
        
        // Kirim notif test ke Telegram
        const message = `🔔 *WEBHOOK TEST*\n\n` +
            `Event: payment.test\n` +
            `Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}\n\n` +
            `✅ Webhook aktif dan berjalan!`;
        
        try {
            await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
            console.log('✅ Test webhook notification sent');
        } catch(e) {
            console.error('Failed to send test notification:', e);
        }
        
        return res.status(200).json({ received: true, event: 'test' });
    }
    
    return res.status(200).json({ received: true, event: data.event });
}
