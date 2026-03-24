export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    const { action, game, itemId, phone } = req.query;
    
    // DAFTAR GAME (Free Fire & Mobile Legends aja)
    const games = [
        { name: "Mobile Legends", image: "https://cdn-icons-png.flaticon.com/512/1051/1051272.png", slug: "mobile-legends" },
        { name: "Free Fire", image: "https://cdn-icons-png.flaticon.com/512/1051/1051283.png", slug: "free-fire" }
    ];
    
    // DAFTAR ITEM
    const itemsByGame = {
        "Mobile Legends": [
            { name: "5 Diamonds", price: 1000, priceText: "Rp 1.000" },
            { name: "12 Diamonds", price: 2500, priceText: "Rp 2.500" },
            { name: "26 Diamonds", price: 5000, priceText: "Rp 5.000" },
            { name: "56 Diamonds", price: 10000, priceText: "Rp 10.000" },
            { name: "115 Diamonds", price: 20000, priceText: "Rp 20.000" },
            { name: "238 Diamonds", price: 40000, priceText: "Rp 40.000" },
            { name: "478 Diamonds", price: 80000, priceText: "Rp 80.000" },
            { name: "Weekly Pass", price: 15000, priceText: "Rp 15.000" },
            { name: "Starlight Member", price: 75000, priceText: "Rp 75.000" }
        ],
        "Free Fire": [
            { name: "5 Diamonds", price: 1000, priceText: "Rp 1.000" },
            { name: "12 Diamonds", price: 2500, priceText: "Rp 2.500" },
            { name: "26 Diamonds", price: 5000, priceText: "Rp 5.000" },
            { name: "56 Diamonds", price: 10000, priceText: "Rp 10.000" },
            { name: "115 Diamonds", price: 20000, priceText: "Rp 20.000" },
            { name: "238 Diamonds", price: 40000, priceText: "Rp 40.000" },
            { name: "478 Diamonds", price: 80000, priceText: "Rp 80.000" },
            { name: "Weekly Pass", price: 15000, priceText: "Rp 15.000" },
            { name: "Elite Pass", price: 150000, priceText: "Rp 150.000" }
        ]
    };
    
    // ACTION: GET GAMES LIST
    if (action === 'getGames') {
        return res.status(200).json({
            success: true,
            games: games
        });
    }
    
    // ACTION: GET ITEMS BY GAME
    if (action === 'getItems') {
        if (!game) {
            return res.status(400).json({ success: false, error: 'Parameter game wajib diisi' });
        }
        
        const items = itemsByGame[game] || [];
        
        return res.status(200).json({
            success: true,
            game: game,
            items: items
        });
    }
    
    // ACTION: GENERATE QRIS
    if (action === 'generateQRIS') {
        if (!phone) {
            return res.status(400).json({ success: false, error: 'Parameter phone wajib diisi' });
        }
        
        // Buat QRIS dummy (karena kita gak punya API pembayaran)
        // Di sini kamu bisa generate QRIS bikin sendiri atau pake API lain
        const { QRCode } = await import('qrcode');
        
        const trxId = 'ITM' + Date.now().toString(36).toUpperCase();
        const qrData = `YANTOPAY|${trxId}|${phone}|${game}|${itemId || 'topup'}`;
        
        // Generate QR code
        const qrCodeBase64 = await QRCode.toDataURL(qrData, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 300
        });
        
        return res.status(200).json({
            success: true,
            screenshot: qrCodeBase64.split(',')[1],
            trxId: trxId,
            phone: phone,
            game: game,
            timestamp: new Date().toISOString()
        });
    }
    
    return res.status(400).json({ success: false, error: 'Action tidak dikenal' });
}