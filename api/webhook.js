// Secret key dari Qrispy
const WEBHOOK_SECRET = 'whsec_jJfqxO5wpcbQQF7sMVURsJ7re3ofIVTX';

// Telegram config
const TELEGRAM_TOKEN = '8236149325:AAGDPsOD5HuK-sVcGaEE-v80QKd60A_9ehU';
const TELEGRAM_CHAT_ID = '8182530431';

export default async function handler(req, res) {
    // Hanya terima POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // Ambil raw body untuk verifikasi signature
        const rawBody = JSON.stringify(req.body);
        const signature = req.headers['x-qrispy-signature'];
        
        // Verifikasi signature (opsional tapi direkomendasikan)
        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', WEBHOOK_SECRET)
            .update(rawBody)
            .digest('hex');
        
        if (signature && !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
            console.error('Invalid signature');
            return res.status(401).json({ error: 'Invalid signature' });
        }
        
        const data = req.body;
        console.log('Webhook diterima:', JSON.stringify(data, null, 2));
        
        // Cek event type
        const event = data.event;
        const payload = data.data;
        
        // Kalau event = payment.received (pembayaran masuk)
        if (event === 'payment.received') {
            const nominal = payload.amount;
            const receivedAmount = payload.received_amount;
            const qrisId = payload.qris_id;
            const paidAt = payload.paid_at;
            const uniqueId = payload.unique_id;
            
            // Format rupiah
            const formatRp = (n) => new Intl.NumberFormat('id-ID', { 
                style: 'currency', 
                currency: 'IDR', 
                minimumFractionDigits: 0 
            }).format(n);
            
            // Format waktu
            const waktu = new Date(paidAt).toLocaleString('id-ID', {
                timeZone: 'Asia/Jakarta',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            // Pesan ke Telegram
            const message = `✅ *PEMBAYARAN DITERIMA!*\n\n` +
                `💰 *${formatRp(nominal)}* telah masuk ke akun mu\n` +
                `🆔 ID QRIS: \`${qrisId}\`\n` +
                `🔢 Kode Unik: ${uniqueId}\n` +
                `📅 Waktu: ${waktu}\n\n` +
                `---\nQRIS YANTO - Auto Payment`;
            
            // Kirim notif ke Telegram
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
            console.log('Telegram response:', tgResult);
            
            if (tgResult.ok) {
                console.log('✅ Notifikasi Telegram terkirim!');
            } else {
                console.error('❌ Gagal kirim Telegram:', tgResult);
            }
        } else {
            console.log(`Event lain: ${event} - diabaikan`);
        }
        
        // Selalu balas 200 ke Qrispy
        return res.status(200).json({ 
            received: true, 
            event: event,
            message: 'Webhook diterima' 
        });
        
    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ error: error.message });
    }
              }
