export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const data = req.body;
    console.log('📨 Webhook diterima:', JSON.stringify(data, null, 2));
    
    const TELEGRAM_TOKEN = '8236149325:AAGDPsOD5HuK-sVcGaEE-v80QKd60A_9ehU';
    const TELEGRAM_CHAT_ID = '8182530431';
    
    // Format pesan
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
            message: isPayment ? 'payment_processed' : 'test_received'
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
