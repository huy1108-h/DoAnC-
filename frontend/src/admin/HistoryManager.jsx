// ================= FRONTEND: HistoryManager.jsx =================
import React, { useEffect, useState } from "react";
import "../css/HistoryManager.css";

function HistoryManager(){

  const [history,setHistory] = useState([]);
  const [stats,setStats] = useState(null);

  const token = sessionStorage.getItem("token");

  const loadHistory = async () => {
    try {
      const res = await fetch("http://localhost:5050/api/History",{
        headers:{ Authorization:"Bearer " + token }
      });

      if(!res.ok) throw new Error();

      const data = await res.json();
      setHistory(data);
    } catch {
      console.log("Lỗi tải history");
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch("http://localhost:5050/api/History/stats",{
        headers:{ Authorization:"Bearer " + token }
      });

      if(!res.ok){
        console.log("Stats API lỗi", res.status);
        setStats({ total: 0, today: 0, topPois: [] });
        return;
      }

      const data = await res.json();

      // đảm bảo không bị undefined
      setStats({
        total: data.total || 0,
        today: data.today || 0,
        topPois: data.topPois || []
      });

    } catch {
      console.log("Lỗi tải stats");
      setStats({ total: 0, today: 0, topPois: [] });
    }
  };

  useEffect(()=>{
    loadHistory();
    loadStats();
  },[]);

  const formatDate = (date)=> new Date(date).toLocaleString();

  return(
    <div className="history-container">

      <div className="history-header">📜 Lịch sử người dùng</div>

      {stats && (
        <div className="history-stats">
          <div className="stat-card">
            <h3>Tổng số lần truy cập</h3>
            <p>{stats.total}</p>
          </div>

          <div className="stat-card">
            <h3>Hôm nay</h3>
            <p>{stats.today}</p>
          </div>
        </div>
      )}

      {stats && stats.topPois && (
        <div className="chart-card">
          <h3>Top POI</h3>
          {stats.topPois.map(p => (
            <div key={p.poi}>
              POI {p.poi}: {p.count}
            </div>
          ))}
        </div>
      )}

      <div className="history-timeline">

        {history.map(h =>(

          <div className="timeline-item" key={h.id}>

            <div className="timeline-dot"></div>

            <div className="timeline-content">

              <div>👤 User: {h.users_id}</div>
              <div>🎯 Event: {h.event_type || h.action}</div>
              <div>📍 POI: {h.narrationPointId}</div>
              <div>📱 Device: {h.device_os || h.device_id}</div>
              <div>🕒 {formatDate(h.created_at)}</div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default HistoryManager;
