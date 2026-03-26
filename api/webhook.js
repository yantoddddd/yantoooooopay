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
    
    let message = '';
    
    if (data.event === 'payment.received') {
        const nominal = data.data.amount;
        const qrisId = data.data.qris_id;
        const uniqueId = data.data.unique_id;
        
        message = `✅ *PEMBAYARAN DITERIMA!*\n\n` +
            `💰 *${formatRp(nominal)}* telah masuk ke akun mu\n` +
            `🆔 ID: \`${qrisId}\`\n` +
            `🔢 Kode: ${uniqueId}\n` +
            `📅 ${new Date().toLocaleString('id-ID')}\n\n` +
            `---\nYANTO PAY`;
    } else {
        message = `🔔 *Webhook Test*\n\nEvent: ${data.event}\nWaktu: ${new Date().toLocaleString('id-ID')}`;
    }
    
    // Kirim ke Telegram dengan timeout 10 detik
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);
        
        const tgResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeout);
        const tgResult = await tgResponse.json();
        
        console.log('📨 Telegram response:', tgResult);
        
        if (tgResult.ok) {
            console.log('✅ Telegram berhasil!');
        } else {
            console.error('❌ Telegram error:', tgResult);
        }
        
        return res.status(200).json({ 
            received: true, 
            telegram: tgResult.ok,
            event: data.event
        });
        
    } catch (error) {
        console.error('❌ Error kirim Telegram:', error);
        return res.status(200).json({ 
            received: true, 
            telegram: false, 
            error: error.message,
            event: data.event
        });
    }
        }
