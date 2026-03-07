import { useEffect, useState } from "react";

function SellerDashboard() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5050/api/seller/dashboard", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    })
      .then(res => res.text())
      .then(data => setMessage(data))
      .catch(() => setMessage("Không có quyền truy cập"));
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>Seller Dashboard 🏪</h1>
      <p>{message}</p>
    </div>
  );
}

export default SellerDashboard;