// api/admin.js
// Password admin disimpan di backend, gak keliatan di frontend
export default function handler(req, res) {
    const { password } = req.query;
    const ADMIN_PASSWORD = "botakganteng"; // Ganti password sesuka kamu
    
    if(password === ADMIN_PASSWORD){
        res.status(200).json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
}
