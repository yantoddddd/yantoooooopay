export default async function handler(req, res) {
  const API_KEY = "sk-3a61164a-b2ae9ad9df63-b645e4cc4468";
  const MERCHANT_ID = "MID-YAN5208";

  const { action, data } = req.body;

  let url = "";
  let options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api_key": API_KEY,
      "merchant_id": MERCHANT_ID
    }
  };

  if(action === "services"){
    url = "https://flowix.web.id/api/v1/services";
    options.body = JSON.stringify({ type: "prabayar" });
  }

  if(action === "order"){
    url = "https://flowix.web.id/api/v1/transaction/create";
    options.body = JSON.stringify(data);
  }

  if(action === "status"){
    url = "https://flowix.web.id/api/v1/transaction/status";
    options.body = JSON.stringify(data);
  }

  try{
    const response = await fetch(url, options);
    const result = await response.json();
    res.status(200).json(result);
  }catch(e){
    res.status(500).json({ success:false, message:"Server error" });
  }
}
